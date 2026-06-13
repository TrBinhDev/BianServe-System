import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import prisma from '../../config/database';
import { DateRangeQuery, RevenueQuery, ExportQuery } from './statistics.schema';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);

// Helper lấy khoảng thời gian, mặc định tháng hiện tại
const getDateRange = (query: DateRangeQuery) => {
  const start = query.start_date
    ? dayjs(query.start_date).startOf('day').toDate()
    : dayjs().startOf('month').toDate();
  const end = query.end_date
    ? dayjs(query.end_date).endOf('day').toDate()
    : dayjs().endOf('month').toDate();
  return { start, end };
};

// ─── Doanh thu ────────────────────────────────────────────────
export const getRevenue = async (query: RevenueQuery) => {
  const { start, end } = getDateRange(query);

  const orders = await prisma.order.findMany({
    where: { status: 'completed', createdAt: { gte: start, lte: end } },
    select: { totalAmount: true, createdAt: true },
  });

  // Group theo type
  const grouped: Record<string, number> = {};
  for (const order of orders) {
    let key: string;
    const d = dayjs(order.createdAt);
    if (query.type === 'day') key = d.format('YYYY-MM-DD');
    else if (query.type === 'week') key = `${d.year()}-W${String(d.week()).padStart(2, '0')}`;
    else if (query.type === 'year') key = d.format('YYYY');
    else key = d.format('YYYY-MM');

    grouped[key] = (grouped[key] || 0) + Number(order.totalAmount);
  }

  const total = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  // So sánh kỳ trước
  const diff = dayjs(end).diff(dayjs(start), 'day') + 1;
  const prevStart = dayjs(start).subtract(diff, 'day').toDate();
  const prevEnd = dayjs(start).subtract(1, 'day').endOf('day').toDate();

  const prevOrders = await prisma.order.findMany({
    where: { status: 'completed', createdAt: { gte: prevStart, lte: prevEnd } },
    select: { totalAmount: true },
  });
  const prevTotal = prevOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const growthRate = prevTotal === 0 ? null : ((total - prevTotal) / prevTotal) * 100;

  return { data: grouped, total, prevTotal, growthRate };
};

// ─── Đơn hàng ────────────────────────────────────────────────
export const getOrderStats = async (query: DateRangeQuery) => {
  const { start, end } = getDateRange(query);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { status: true, createdAt: true },
  });

  const byStatus = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  const byHour: Record<number, number> = {};

  for (const order of orders) {
    byStatus[order.status]++;
    const hour = dayjs(order.createdAt).hour();
    byHour[hour] = (byHour[hour] || 0) + 1;
  }

  const total = orders.length;
  const cancelRate = total === 0 ? 0 : (byStatus.cancelled / total) * 100;

  return { total, byStatus, cancelRate, byHour };
};

// ─── Món ăn ───────────────────────────────────────────────────
export const getProductStats = async (query: DateRangeQuery) => {
  const { start, end } = getDateRange(query);

  const items = await prisma.orderItem.findMany({
    where: { order: { status: 'completed', createdAt: { gte: start, lte: end } } },
    include: { product: { select: { id: true, name: true } } },
  });

  const map: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const item of items) {
    if (!map[item.productId]) {
      map[item.productId] = { name: item.product.name, quantity: 0, revenue: 0 };
    }
    map[item.productId].quantity += item.quantity;
    map[item.productId].revenue += Number(item.unitPrice) * item.quantity;
  }

  const list = Object.entries(map).map(([id, v]) => ({ id, ...v }));
  const topByQuantity = [...list].sort((a, b) => b.quantity - a.quantity).slice(0, 10);
  const topByRevenue = [...list].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return { topByQuantity, topByRevenue };
};

// ─── Bàn ─────────────────────────────────────────────────────
export const getTableStats = async (query: DateRangeQuery) => {
  const { start, end } = getDateRange(query);

  const orders = await prisma.order.findMany({
    where: { status: 'completed', createdAt: { gte: start, lte: end } },
    include: { table: { select: { id: true, tableNumber: true } } },
  });

  const map: Record<string, { tableNumber: string; orderCount: number; revenue: number }> = {};
  for (const order of orders) {
    const tid = order.tableId;
    if (!map[tid]) map[tid] = { tableNumber: order.table.tableNumber, orderCount: 0, revenue: 0 };
    map[tid].orderCount++;
    map[tid].revenue += Number(order.totalAmount);
  }

  const list = Object.entries(map)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  return list;
};

// ─── Khuyến mãi ───────────────────────────────────────────────
export const getPromotionStats = async (query: DateRangeQuery) => {
  const { start, end } = getDateRange(query);

  const usages = await prisma.promotionUsage.findMany({
    where: { usedAt: { gte: start, lte: end } },
    include: {
      promotion: { select: { id: true, name: true, code: true, type: true, value: true } },
    },
  });

  const map: Record<string, { name: string; code: string; usageCount: number }> = {};
  for (const usage of usages) {
    const pid = usage.promotionId;
    if (!map[pid])
      map[pid] = { name: usage.promotion.name, code: usage.promotion.code, usageCount: 0 };
    map[pid].usageCount++;
  }

  return Object.entries(map)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.usageCount - a.usageCount);
};

// ─── Dashboard ────────────────────────────────────────────────
export const getDashboard = async () => {
  const todayStart = dayjs().startOf('day').toDate();
  const todayEnd = dayjs().endOf('day').toDate();

  const [revenueToday, ordersToday, pendingOrders, tables, topProducts] = await Promise.all([
    prisma.order.aggregate({
      where: { status: 'completed', createdAt: { gte: todayStart, lte: todayEnd } },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.table.groupBy({ by: ['status'], _count: true }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { status: 'completed', createdAt: { gte: todayStart, lte: todayEnd } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  const occupied = tables.find((t) => t.status === 'occupied')?._count ?? 0;
  const total = tables.reduce((sum, t) => sum + t._count, 0);

  return {
    revenueToday: Number(revenueToday._sum.totalAmount ?? 0),
    ordersToday,
    pendingOrders,
    tableOccupancyRate: total === 0 ? 0 : (occupied / total) * 100,
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      name: productMap.get(p.productId) ?? '',
      quantity: p._sum.quantity ?? 0,
    })),
  };
};

// ─── Export ───────────────────────────────────────────────────
export const exportRevenue = async (query: ExportQuery, res: Response) => {
  const { start, end } = getDateRange(query);
  const orders = await prisma.order.findMany({
    where: { status: 'completed', createdAt: { gte: start, lte: end } },
    include: { table: { select: { tableNumber: true } } },
    orderBy: { createdAt: 'asc' },
  });

  if (query.format === 'excel') {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Doanh thu');
    ws.columns = [
      { header: 'Mã đơn', key: 'orderCode', width: 20 },
      { header: 'Bàn', key: 'table', width: 10 },
      { header: 'Tổng tiền', key: 'total', width: 15 },
      { header: 'Ngày', key: 'date', width: 20 },
    ];
    for (const order of orders) {
      ws.addRow({
        orderCode: order.orderCode,
        table: order.table.tableNumber,
        total: Number(order.totalAmount),
        date: dayjs(order.createdAt).format('DD/MM/YYYY HH:mm'),
      });
    }
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=revenue.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } else {
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=revenue.pdf');
    doc.pipe(res);
    doc.fontSize(16).text('Báo cáo doanh thu', { align: 'center' });
    doc.moveDown();
    for (const order of orders) {
      doc
        .fontSize(10)
        .text(
          `${order.orderCode} | Bàn ${order.table.tableNumber} | ${Number(order.totalAmount).toLocaleString('vi-VN')}đ | ${dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}`
        );
    }
    doc.end();
  }
};

export const exportOrders = async (query: ExportQuery, res: Response) => {
  const { start, end } = getDateRange(query);
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { table: { select: { tableNumber: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Đơn hàng');
  ws.columns = [
    { header: 'Mã đơn', key: 'orderCode', width: 20 },
    { header: 'Bàn', key: 'table', width: 10 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Tổng tiền', key: 'total', width: 15 },
    { header: 'Ngày', key: 'date', width: 20 },
  ];
  for (const order of orders) {
    ws.addRow({
      orderCode: order.orderCode,
      table: order.table.tableNumber,
      status: order.status,
      total: Number(order.totalAmount),
      date: dayjs(order.createdAt).format('DD/MM/YYYY HH:mm'),
    });
  }
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
  await wb.xlsx.write(res);
  res.end();
};

export const exportProducts = async (query: ExportQuery, res: Response) => {
  const { topByQuantity } = await getProductStats({
    start_date: query.start_date,
    end_date: query.end_date,
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Top món ăn');
  ws.columns = [
    { header: 'Tên món', key: 'name', width: 30 },
    { header: 'Số lượng', key: 'quantity', width: 15 },
    { header: 'Doanh thu', key: 'revenue', width: 15 },
  ];
  for (const item of topByQuantity) {
    ws.addRow({ name: item.name, quantity: item.quantity, revenue: item.revenue });
  }
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=top-products.xlsx');
  await wb.xlsx.write(res);
  res.end();
};
