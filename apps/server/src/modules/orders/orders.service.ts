import dayjs from 'dayjs';
import prisma from '../../config/database';
import { getIO } from '../../config/socket';
import { AppError } from '../../shared/errors/AppError';
import { MSG } from '../../shared/constants/messages';
import { getPagination, buildPaginationMeta } from '../../shared/utils/pagination';
import {
  CreateOrderInput,
  AddItemInput,
  UpdateItemInput,
  CancelOrderInput,
  UpdateStatusInput,
  ListOrdersQuery,
} from './orders.schema';

const generateOrderCode = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${date}-${random}`;
};

const orderInclude = {
  table: { select: { id: true, tableNumber: true } },
  items: {
    include: { product: { select: { id: true, name: true, imageUrl: true } } },
  },
};

export const createOrder = async (input: CreateOrderInput) => {
  const table = await prisma.table.findUnique({ where: { id: input.tableId } });
  if (!table) throw new AppError(404, MSG.table.NOT_FOUND);

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isAvailable: true },
  });
  if (products.length !== productIds.length) {
    throw new AppError(400, MSG.product.NOT_FOUND);
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  const totalAmount = input.items.reduce((sum, item) => {
    return sum + Number(productMap.get(item.productId)!.price) * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderCode: generateOrderCode(),
        tableId: input.tableId,
        totalAmount,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            note: item.note,
            unitPrice: productMap.get(item.productId)!.price,
          })),
        },
      },
      include: orderInclude,
    });

    await tx.table.update({ where: { id: input.tableId }, data: { status: 'occupied' } });
    return newOrder;
  });

  // Emit theo đúng tên design
  getIO().emit('order_created', {
    orderId: order.id,
    orderCode: order.orderCode,
    tableId: order.tableId,
    table: order.table,
    totalAmount: order.totalAmount,
  });

  return order;
};

export const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);
  return order;
};

export const addItem = async (orderId: string, input: AddItemInput) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);
  if (order.status !== 'pending') throw new AppError(400, MSG.order.INVALID_STATUS);

  const product = await prisma.product.findUnique({
    where: { id: input.productId, isAvailable: true },
  });
  if (!product) throw new AppError(404, MSG.product.NOT_FOUND);

  const newTotal = Number(order.totalAmount) + Number(product.price) * input.quantity;

  await prisma.$transaction([
    prisma.orderItem.create({
      data: {
        orderId,
        productId: input.productId,
        quantity: input.quantity,
        note: input.note,
        unitPrice: product.price,
      },
    }),
    prisma.order.update({ where: { id: orderId }, data: { totalAmount: newTotal } }),
  ]);

  return prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
};

export const updateItem = async (orderId: string, itemId: string, input: UpdateItemInput) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);
  if (order.status !== 'pending') throw new AppError(400, MSG.order.INVALID_STATUS);

  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item || item.orderId !== orderId) throw new AppError(404, MSG.order.ITEM_NOT_FOUND);

  const diff = (input.quantity - item.quantity) * Number(item.unitPrice);
  const newTotal = Number(order.totalAmount) + diff;

  await prisma.$transaction([
    prisma.orderItem.update({
      where: { id: itemId },
      data: { quantity: input.quantity, note: input.note },
    }),
    prisma.order.update({ where: { id: orderId }, data: { totalAmount: newTotal } }),
  ]);

  return prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
};

export const deleteItem = async (orderId: string, itemId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);
  if (order.status !== 'pending') throw new AppError(400, MSG.order.INVALID_STATUS);

  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item || item.orderId !== orderId) throw new AppError(404, MSG.order.ITEM_NOT_FOUND);

  const newTotal = Number(order.totalAmount) - Number(item.unitPrice) * item.quantity;

  await prisma.$transaction([
    prisma.orderItem.delete({ where: { id: itemId } }),
    prisma.order.update({ where: { id: orderId }, data: { totalAmount: newTotal } }),
  ]);
};

export const listOrders = async (query: ListOrdersQuery) => {
  const { page, limit, skip } = getPagination(query);

  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.tableId) where.tableId = query.tableId;
  if (query.search) where.orderCode = { contains: query.search, mode: 'insensitive' };
  if (query.start_date || query.end_date) {
    where.createdAt = {};
    if (query.start_date) where.createdAt.gte = dayjs(query.start_date).startOf('day').toDate();
    if (query.end_date) where.createdAt.lte = dayjs(query.end_date).endOf('day').toDate();
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: orderInclude,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, meta: buildPaginationMeta(total, page, limit) };
};

export const updateStatus = async (orderId: string, input: UpdateStatusInput) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);

  if (input.status === 'confirmed' && order.status !== 'pending') {
    throw new AppError(400, MSG.order.INVALID_STATUS);
  }
  if (input.status === 'completed' && order.status !== 'confirmed') {
    throw new AppError(400, MSG.order.INVALID_STATUS);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.update({
      where: { id: orderId },
      data: { status: input.status },
      include: orderInclude,
    });

    if (input.status === 'completed') {
      const activeOrders = await tx.order.count({
        where: { tableId: order.tableId, status: { in: ['pending', 'confirmed'] } },
      });
      if (activeOrders === 0) {
        await tx.table.update({ where: { id: order.tableId }, data: { status: 'available' } });
      }
    }

    return result;
  });

  getIO().emit('order_status_changed', { orderId, status: input.status });
  return updated;
};

export const cancelOrder = async (orderId: string, accountId: string, input: CancelOrderInput) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);
  if (order.status === 'completed' || order.status === 'cancelled') {
    throw new AppError(400, MSG.order.INVALID_STATUS);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const cancelled = await tx.order.update({
      where: { id: orderId },
      data: { status: 'cancelled', cancelReason: input.cancelReason, cancelledBy: accountId },
      include: orderInclude,
    });

    const activeOrders = await tx.order.count({
      where: { tableId: order.tableId, status: { in: ['pending', 'confirmed'] } },
    });
    if (activeOrders === 0) {
      await tx.table.update({ where: { id: order.tableId }, data: { status: 'available' } });
    }

    return cancelled;
  });

  getIO().emit('order_cancelled', { orderId, reason: input.cancelReason });
  return updated;
};
