import prisma from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { MSG } from "../../shared/constants/messages";
import { getPagination, buildPaginationMeta } from "../../shared/utils/pagination";
import {
  CreateProductInput,
  UpdateProductInput,
  AvailabilityInput,
  ListProductsQuery,
} from "./products.schema";

export const createProduct = async (input: CreateProductInput) => {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new AppError(404, MSG.category.NOT_FOUND);

  return prisma.product.create({ data: input });
};

export const listProducts = async (query: ListProductsQuery) => {
  const { page, limit, skip } = getPagination(query);

  const where: any = {};
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.isAvailable !== undefined) where.isAvailable = query.isAvailable;
  if (query.search) where.name = { contains: query.search, mode: "insensitive" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, meta: buildPaginationMeta(total, page, limit) };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!product) throw new AppError(404, MSG.product.NOT_FOUND);
  return product;
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, MSG.product.NOT_FOUND);

  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new AppError(404, MSG.category.NOT_FOUND);
  }

  return prisma.product.update({ where: { id }, data: input });
};

export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, MSG.product.NOT_FOUND);
  await prisma.product.delete({ where: { id } });
};

export const updateAvailability = async (id: string, input: AvailabilityInput) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, MSG.product.NOT_FOUND);

  return prisma.product.update({ where: { id }, data: { isAvailable: input.isAvailable } });
};

// Public: menu cho khách scan QR — group theo category
export const getMenu = async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { name: "asc" },
      },
    },
  });
  return categories;
};