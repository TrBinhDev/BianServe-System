import prisma from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { MSG } from "../../shared/constants/messages";
import { getPagination, buildPaginationMeta } from "../../shared/utils/pagination";
import { generateQRBase64 } from "../qr/qr.service";
import { CreateTableInput, UpdateTableInput, ListTablesQuery } from "./tables.schema";

export const createTable = async (input: CreateTableInput) => {
  const existing = await prisma.table.findUnique({ where: { tableNumber: input.tableNumber } });
  if (existing) throw new AppError(409, MSG.table.NUMBER_EXISTS);

  // Tạo bàn trước để lấy id
  const table = await prisma.table.create({
    data: { tableNumber: input.tableNumber, capacity: input.capacity },
  });

  // Gen QR dựa trên tableId → lưu lại
  const qrCode = await generateQRBase64(table.id);
  const updated = await prisma.table.update({
    where: { id: table.id },
    data: { qrCode },
  });

  return updated;
};

export const listTables = async (query: ListTablesQuery) => {
  const { page, limit, skip } = getPagination(query);

  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.search) where.tableNumber = { contains: query.search, mode: "insensitive" };

  const [tables, total] = await Promise.all([
    prisma.table.findMany({
      where,
      skip,
      take: limit,
      orderBy: { tableNumber: "asc" },
    }),
    prisma.table.count({ where }),
  ]);

  return { tables, meta: buildPaginationMeta(total, page, limit) };
};

export const getTableById = async (id: string) => {
  const table = await prisma.table.findUnique({ where: { id } });
  if (!table) throw new AppError(404, MSG.table.NOT_FOUND);
  return table;
};

export const updateTable = async (id: string, input: UpdateTableInput) => {
  const table = await prisma.table.findUnique({ where: { id } });
  if (!table) throw new AppError(404, MSG.table.NOT_FOUND);

  if (input.tableNumber && input.tableNumber !== table.tableNumber) {
    const existing = await prisma.table.findUnique({ where: { tableNumber: input.tableNumber } });
    if (existing) throw new AppError(409, MSG.table.NUMBER_EXISTS);
  }

  return prisma.table.update({ where: { id }, data: input });
};

export const deleteTable = async (id: string) => {
  const table = await prisma.table.findUnique({ where: { id } });
  if (!table) throw new AppError(404, MSG.table.NOT_FOUND);
  await prisma.table.delete({ where: { id } });
};