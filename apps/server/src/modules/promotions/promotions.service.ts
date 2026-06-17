import dayjs from 'dayjs';
import prisma from '../../config/database';
import { getIO } from '../../config/socket';
import { AppError } from '../../shared/errors/AppError';
import { MSG } from '../../shared/constants/messages';
import { getPagination, buildPaginationMeta } from '../../shared/utils/pagination';
import {
  CreatePromotionInput,
  UpdatePromotionInput,
  ApplyPromotionInput,
  ListPromotionsQuery,
  PreviewPromotionInput,
} from './promotions.schema';

const promotionInclude = {
  promotionProducts: { include: { product: { select: { id: true, name: true } } } },
  promotionCategories: { include: { category: { select: { id: true, name: true } } } },
};

export const createPromotion = async (input: CreatePromotionInput) => {
  const existing = await prisma.promotion.findUnique({ where: { code: input.code } });
  if (existing) throw new AppError(409, MSG.promotion.CODE_EXISTS);

  const { productIds, categoryIds, ...data } = input;

  const promotion = await prisma.promotion.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      dayOfWeek: data.dayOfWeek ?? [],
      promotionProducts: productIds?.length
        ? { create: productIds.map((id) => ({ productId: id })) }
        : undefined,
      promotionCategories: categoryIds?.length
        ? { create: categoryIds.map((id) => ({ categoryId: id })) }
        : undefined,
    },
    include: promotionInclude,
  });

  getIO().emit('promotions_updated', { action: 'created', promotionId: promotion.id });
  return promotion;
};

export const listPromotions = async (query: ListPromotionsQuery) => {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.isActive !== undefined) where.isActive = query.isActive;

  const [promotions, total] = await Promise.all([
    prisma.promotion.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: promotionInclude,
    }),
    prisma.promotion.count({ where }),
  ]);

  return { promotions, meta: buildPaginationMeta(total, page, limit) };
};

// Public: chỉ lấy KM đang hoạt động
export const listActivePromotions = async () => {
  const now = new Date();
  return prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    select: {
      id: true,
      name: true,
      code: true,
      type: true,
      value: true,
      minOrderValue: true,
      endDate: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPromotionById = async (id: string) => {
  const promotion = await prisma.promotion.findUnique({ where: { id }, include: promotionInclude });
  if (!promotion) throw new AppError(404, MSG.promotion.NOT_FOUND);
  return promotion;
};

export const updatePromotion = async (id: string, input: UpdatePromotionInput) => {
  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) throw new AppError(404, MSG.promotion.NOT_FOUND);

  if (input.code && input.code !== promotion.code) {
    const existing = await prisma.promotion.findUnique({ where: { code: input.code } });
    if (existing) throw new AppError(409, MSG.promotion.CODE_EXISTS);
  }

  const { productIds, categoryIds, ...data } = input;

  const updated = await prisma.promotion.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: promotionInclude,
  });

  getIO().emit('promotions_updated', { action: 'updated', promotionId: id });
  return updated;
};

export const deletePromotion = async (id: string) => {
  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) throw new AppError(404, MSG.promotion.NOT_FOUND);
  await prisma.promotion.delete({ where: { id } });
  getIO().emit('promotions_updated', { action: 'deleted', promotionId: id });
};

export const applyPromotion = async (input: ApplyPromotionInput) => {
  const now = dayjs();

  const promotion = await prisma.promotion.findUnique({
    where: { code: input.code },
    include: promotionInclude,
  });
  if (!promotion || !promotion.isActive) throw new AppError(400, MSG.promotion.INVALID_CODE);

  if (now.isBefore(dayjs(promotion.startDate)) || now.isAfter(dayjs(promotion.endDate))) {
    throw new AppError(400, MSG.promotion.EXPIRED);
  }

  if (promotion.timeStart && promotion.timeEnd) {
    const currentTime = now.format('HH:mm');
    if (currentTime < promotion.timeStart || currentTime > promotion.timeEnd) {
      throw new AppError(400, MSG.promotion.EXPIRED);
    }
  }

  if (promotion.dayOfWeek.length > 0 && !promotion.dayOfWeek.includes(now.day())) {
    throw new AppError(400, MSG.promotion.EXPIRED);
  }

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);

  if (promotion.minOrderValue && Number(order.totalAmount) < Number(promotion.minOrderValue)) {
    throw new AppError(400, MSG.promotion.MIN_ORDER);
  }

  if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
    throw new AppError(400, MSG.promotion.USAGE_LIMIT);
  }

  if (promotion.perUserLimit) {
    const userUsageCount = await prisma.promotionUsage.count({
      where: { promotionId: promotion.id, userSessionId: input.userSessionId },
    });
    if (userUsageCount >= promotion.perUserLimit) {
      throw new AppError(400, MSG.promotion.USAGE_LIMIT);
    }
  }

  const allowedProductIds = promotion.promotionProducts.map((p) => p.productId);
  const allowedCategoryIds = promotion.promotionCategories.map((c) => c.categoryId);

  if (allowedProductIds.length > 0 || allowedCategoryIds.length > 0) {
    const orderProductIds = order.items.map((i) => i.productId);
    const orderCategoryIds = order.items.map((i) => i.product.categoryId);

    const hasMatch =
      orderProductIds.some((id) => allowedProductIds.includes(id)) ||
      orderCategoryIds.some((id) => allowedCategoryIds.includes(id));

    if (!hasMatch) throw new AppError(400, MSG.promotion.INVALID_CODE);
  }

  let discountAmount = 0;
  if (promotion.type === 'PERCENT') {
    discountAmount = (Number(order.totalAmount) * Number(promotion.value)) / 100;
    if (promotion.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, Number(promotion.maxDiscountAmount));
    }
  } else {
    discountAmount = Number(promotion.value);
  }

  const finalAmount = Math.max(0, Number(order.totalAmount) - discountAmount);

  await prisma.$transaction([
    prisma.promotionUsage.create({
      data: {
        promotionId: promotion.id,
        orderId: input.orderId,
        userSessionId: input.userSessionId,
      },
    }),
    prisma.promotion.update({
      where: { id: promotion.id },
      data: { usedCount: { increment: 1 } },
    }),
    prisma.order.update({
      where: { id: input.orderId },
      data: { discountAmount, finalAmount, promotionCode: promotion.code },
    }),
  ]);

  getIO().emit('order_updated', { orderId: input.orderId }); 

  return { promotionId: promotion.id, code: promotion.code, discountAmount, finalAmount };
};

export const previewPromotion = async (input: PreviewPromotionInput) => {
  const now = dayjs();

  const promotion = await prisma.promotion.findUnique({
    where: { code: input.code },
    include: promotionInclude,
  });
  if (!promotion || !promotion.isActive) throw new AppError(400, MSG.promotion.INVALID_CODE);

  if (now.isBefore(dayjs(promotion.startDate)) || now.isAfter(dayjs(promotion.endDate))) {
    throw new AppError(400, MSG.promotion.EXPIRED);
  }

  if (promotion.timeStart && promotion.timeEnd) {
    const currentTime = now.format('HH:mm');
    if (currentTime < promotion.timeStart || currentTime > promotion.timeEnd) {
      throw new AppError(400, MSG.promotion.EXPIRED);
    }
  }

  if (promotion.dayOfWeek.length > 0 && !promotion.dayOfWeek.includes(now.day())) {
    throw new AppError(400, MSG.promotion.EXPIRED);
  }

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, categoryId: true },
  });

  if (products.length !== productIds.length) {
    // Thay bằng MSG.product.NOT_FOUND nếu bạn có constant này
    throw new AppError(404, 'Một số sản phẩm trong giỏ hàng không tồn tại');
  }

  const priceMap = new Map(products.map((p) => [p.id, Number(p.price)]));
  const totalAmount = input.items.reduce(
    (sum, item) => sum + (priceMap.get(item.productId) ?? 0) * item.quantity,
    0
  );

  if (promotion.minOrderValue && totalAmount < Number(promotion.minOrderValue)) {
    throw new AppError(400, MSG.promotion.MIN_ORDER);
  }

  if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
    throw new AppError(400, MSG.promotion.USAGE_LIMIT);
  }

  if (promotion.perUserLimit && input.userSessionId) {
    const userUsageCount = await prisma.promotionUsage.count({
      where: { promotionId: promotion.id, userSessionId: input.userSessionId },
    });
    if (userUsageCount >= promotion.perUserLimit) {
      throw new AppError(400, MSG.promotion.USAGE_LIMIT);
    }
  }

  const allowedProductIds = promotion.promotionProducts.map((p) => p.productId);
  const allowedCategoryIds = promotion.promotionCategories.map((c) => c.categoryId);

  if (allowedProductIds.length > 0 || allowedCategoryIds.length > 0) {
    const itemCategoryIds = products.map((p) => p.categoryId);
    const hasMatch =
      productIds.some((id) => allowedProductIds.includes(id)) ||
      itemCategoryIds.some((id) => allowedCategoryIds.includes(id));

    if (!hasMatch) throw new AppError(400, MSG.promotion.INVALID_CODE);
  }

  let discountAmount = 0;
  if (promotion.type === 'PERCENT') {
    discountAmount = (totalAmount * Number(promotion.value)) / 100;
    if (promotion.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, Number(promotion.maxDiscountAmount));
    }
  } else {
    discountAmount = Number(promotion.value);
  }

  const finalAmount = Math.max(0, totalAmount - discountAmount);

  return { promotionId: promotion.id, code: promotion.code, discountAmount, finalAmount };
};
