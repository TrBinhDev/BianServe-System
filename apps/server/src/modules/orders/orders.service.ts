import prisma from "../../config/database";
import { getIO } from "../../config/socket";
import { AppError } from "../../shared/errors/AppError";
import { MSG } from "../../shared/constants/messages";
import { getPagination, buildPaginationMeta } from "../../shared/utils/pagination";
import {
  CreateOrderInput,
  AddItemInput,
  UpdateItemInput,
  CancelOrderInput,
  ListOrdersQuery,
} from "./orders.schema";

// Gen mã đơn hàng: ORD-YYYYMMDD-XXXXX
const generateOrderCode = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
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
  // 1. Kiểm tra bàn tồn tại
  const table = await prisma.table.findUnique({ where: { id: input.tableId } });
  if (!table) throw new AppError(404, MSG.table.NOT_FOUND);

  // 2. Lấy giá sản phẩm, kiểm tra còn bán không
  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isAvailable: true },
  });
  if (products.length !== productIds.length) {
    throw new AppError(400, MSG.product.NOT_FOUND);
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // 3. Tính tổng tiền
  const totalAmount = input.items.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + Number(product.price) * item.quantity;
  }, 0);

  // 4. Tạo order + items + cập nhật trạng thái bàn
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

    await tx.table.update({ where: { id: input.tableId }, data: { status: "occupied" } });

    return newOrder;
  });

  // 5. Emit socket cho admin/staff
  getIO().emit("new_order", {
    orderId: order.id,
    orderCode: order.orderCode,
    tableId: order.tableId,
    table: order.table,
    totalAmount: order.totalAmount,
    itemCount: order.items.length,
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
  if (order.status !== "pending") throw new AppError(400, MSG.order.INVALID_STATUS);

  const product = await prisma.product.findUnique({ where: { id: input.productId, isAvailable: true } });
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
  if (order.status !== "pending") throw new AppError(400, MSG.order.INVALID_STATUS);

  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item || item.orderId !== orderId) throw new AppError(404, MSG.order.ITEM_NOT_FOUND);

  const diff = (input.quantity - item.quantity) * Number(item.unitPrice);
  const newTotal = Number(order.totalAmount) + diff;

  await prisma.$transaction([
    prisma.orderItem.update({ where: { id: itemId }, data: { quantity: input.quantity, note: input.note } }),
    prisma.order.update({ where: { id: orderId }, data: { totalAmount: newTotal } }),
  ]);

  return prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
};

export const deleteItem = async (orderId: string, itemId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);
  if (order.status !== "pending") throw new AppError(400, MSG.order.INVALID_STATUS);

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

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: orderInclude,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, meta: buildPaginationMeta(total, page, limit) };
};

export const confirmOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);
  if (order.status !== "pending") throw new AppError(400, MSG.order.INVALID_STATUS);

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "confirmed" },
    include: orderInclude,
  });

  getIO().emit("order_updated", { orderId, status: "confirmed" });
  return updated;
};

export const cancelOrder = async (orderId: string, accountId: string, input: CancelOrderInput) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);
  if (order.status === "completed" || order.status === "cancelled") {
    throw new AppError(400, MSG.order.INVALID_STATUS);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const cancelled = await tx.order.update({
      where: { id: orderId },
      data: { status: "cancelled", cancelReason: input.cancelReason, cancelledBy: accountId },
      include: orderInclude,
    });

    // Kiểm tra bàn còn đơn active không → nếu không thì available
    const activeOrders = await tx.order.count({
      where: { tableId: order.tableId, status: { in: ["pending", "confirmed"] } },
    });
    if (activeOrders === 0) {
      await tx.table.update({ where: { id: order.tableId }, data: { status: "available" } });
    }

    return cancelled;
  });

  getIO().emit("order_updated", { orderId, status: "cancelled" });
  return updated;
};

export const completeOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);
  if (order.status !== "confirmed") throw new AppError(400, MSG.order.INVALID_STATUS);

  const updated = await prisma.$transaction(async (tx) => {
    const completed = await tx.order.update({
      where: { id: orderId },
      data: { status: "completed" },
      include: orderInclude,
    });

    // Kiểm tra bàn còn đơn active không → nếu không thì available
    const activeOrders = await tx.order.count({
      where: { tableId: order.tableId, status: { in: ["pending", "confirmed"] } },
    });
    if (activeOrders === 0) {
      await tx.table.update({ where: { id: order.tableId }, data: { status: "available" } });
    }

    return completed;
  });

  getIO().emit("order_updated", { orderId, status: "completed" });
  return updated;
};