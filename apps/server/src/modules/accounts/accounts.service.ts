import prisma from '../../config/database';
import redis from '../../config/redis';
import { getIO } from '../../config/socket';
import { hashPassword } from '../../shared/utils/hash';
import { AppError } from '../../shared/errors/AppError';
import { MSG } from '../../shared/constants/messages';
import { getPagination, buildPaginationMeta } from '../../shared/utils/pagination';
import {
  CreateAccountInput,
  ChangePasswordInput,
  ChangeStatusInput,
  ListAccountsQuery,
} from './accounts.schema';

export const createAccount = async (input: CreateAccountInput) => {
  const existing = await prisma.account.findUnique({ where: { code: input.code } });
  if (existing) throw new AppError(409, MSG.account.CODE_EXISTS);

  const account = await prisma.account.create({
    data: {
      code: input.code,
      password: await hashPassword(input.password),
      role: input.role,
    },
    select: { id: true, code: true, role: true, isActive: true, createdAt: true },
  });

  return account;
};

export const listAccounts = async (query: ListAccountsQuery) => {
  const { page, limit, skip } = getPagination(query);

  const where: any = {};
  if (query.role) where.role = query.role;
  if (query.is_active !== undefined) where.isActive = query.is_active;
  if (query.search) where.code = { contains: query.search, mode: 'insensitive' };

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, code: true, role: true, isActive: true, createdAt: true },
    }),
    prisma.account.count({ where }),
  ]);

  return { accounts, meta: buildPaginationMeta(total, page, limit) };
};

export const changePassword = async (id: string, input: ChangePasswordInput) => {
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) throw new AppError(404, MSG.account.NOT_FOUND);

  await prisma.account.update({
    where: { id },
    data: { password: await hashPassword(input.password) },
  });
};

export const changeStatus = async (id: string, input: ChangeStatusInput) => {
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) throw new AppError(404, MSG.account.NOT_FOUND);

  await prisma.account.update({
    where: { id },
    data: { isActive: input.isActive },
  });

  if (!input.isActive) {
    await redis.del(`refresh:${id}`);
    getIO().emit('account_locked', { userId: id });
  }
};
