import dayjs from "dayjs";
import prisma from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { MSG } from "../../shared/constants/messages";
import { getPagination, buildPaginationMeta } from "../../shared/utils/pagination";
import { CreateFeedbackInput, ListFeedbacksQuery } from "./feedbacks.schema";

export const createFeedback = async (input: CreateFeedbackInput) => {
  // Kiểm tra order tồn tại
  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order) throw new AppError(404, MSG.order.NOT_FOUND);

  // Kiểm tra đã feedback chưa (unique orderId)
  const existing = await prisma.feedback.findUnique({ where: { orderId: input.orderId } });
  if (existing) throw new AppError(409, MSG.feedback.ALREADY_EXISTS);

  return prisma.feedback.create({
    data: input,
    include: {
      order: { select: { orderCode: true } },
      table: { select: { tableNumber: true } },
    },
  });
};

export const listFeedbacks = async (query: ListFeedbacksQuery) => {
  const { page, limit, skip } = getPagination(query);

  const where: any = {};
  if (query.rating) where.rating = query.rating;
  if (query.search) where.comment = { contains: query.search, mode: "insensitive" };
  if (query.start_date || query.end_date) {
    where.createdAt = {};
    if (query.start_date) where.createdAt.gte = dayjs(query.start_date).startOf("day").toDate();
    if (query.end_date) where.createdAt.lte = dayjs(query.end_date).endOf("day").toDate();
  }

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { orderCode: true } },
        table: { select: { tableNumber: true } },
      },
    }),
    prisma.feedback.count({ where }),
  ]);

  return { feedbacks, meta: buildPaginationMeta(total, page, limit) };
};

export const deleteFeedback = async (id: string) => {
  const feedback = await prisma.feedback.findUnique({ where: { id } });
  if (!feedback) throw new AppError(404, MSG.feedback.NOT_FOUND);
  await prisma.feedback.delete({ where: { id } });
};