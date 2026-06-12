import prisma from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { MSG } from "../../shared/constants/messages";
import { CreateCategoryInput, UpdateCategoryInput } from "./categories.schema";

export const createCategory = async (input: CreateCategoryInput) => {
  const existing = await prisma.category.findUnique({ where: { name: input.name } });
  if (existing) throw new AppError(409, MSG.category.NAME_EXISTS);

  return prisma.category.create({ data: input });
};

export const listCategories = async () => {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
};

export const updateCategory = async (id: string, input: UpdateCategoryInput) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError(404, MSG.category.NOT_FOUND);

  if (input.name && input.name !== category.name) {
    const existing = await prisma.category.findUnique({ where: { name: input.name } });
    if (existing) throw new AppError(409, MSG.category.NAME_EXISTS);
  }

  return prisma.category.update({ where: { id }, data: input });
};

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new AppError(404, MSG.category.NOT_FOUND);
  if (category._count.products > 0) throw new AppError(400, MSG.category.HAS_PRODUCTS);

  await prisma.category.delete({ where: { id } });
};