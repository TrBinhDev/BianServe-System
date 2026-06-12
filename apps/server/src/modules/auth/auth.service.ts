import prisma from '../../config/database';
import redis from '../../config/redis';
import { comparePassword } from '../../shared/utils/hash';
import { signAccessToken, signRefreshToken, verifyToken } from '../../shared/utils/jwt';
import { AppError } from '../../shared/errors/AppError';
import { MSG } from '../../shared/constants/messages';
import { LoginInput } from './auth.schema';

const REFRESH_PREFIX = 'refresh:';

export const login = async (input: LoginInput) => {
  const account = await prisma.account.findUnique({ where: { code: input.code } });
  if (!account) throw new AppError(401, MSG.auth.INVALID_CREDENTIALS);
  if (!account.isActive) throw new AppError(403, MSG.auth.ACCOUNT_LOCKED);

  const valid = await comparePassword(input.password, account.password);
  if (!valid) throw new AppError(401, MSG.auth.INVALID_CREDENTIALS);

  const payload = { id: account.id, code: account.code, role: account.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await redis.set(`${REFRESH_PREFIX}${account.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7);

  return {
    accessToken,
    refreshToken,
    user: { id: account.id, code: account.code, role: account.role },
  };
};

export const refresh = async (refreshToken: string) => {
  let payload: any;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    throw new AppError(401, MSG.auth.TOKEN_INVALID);
  }

  const stored = await redis.get(`${REFRESH_PREFIX}${payload.id}`);
  if (!stored || stored !== refreshToken) {
    throw new AppError(401, MSG.auth.TOKEN_EXPIRED);
  }

  const account = await prisma.account.findUnique({ where: { id: payload.id } });
  if (!account || !account.isActive) throw new AppError(403, MSG.auth.ACCOUNT_LOCKED);

  const newAccessToken = signAccessToken({
    id: account.id,
    code: account.code,
    role: account.role,
  });

  return { accessToken: newAccessToken };
};

export const logout = async (userId: string) => {
  await redis.del(`${REFRESH_PREFIX}${userId}`);
};

export const getMe = async (userId: string) => {
  const account = await prisma.account.findUnique({
    where: { id: userId },
    select: { id: true, code: true, role: true, isActive: true },
  });
  if (!account) throw new AppError(404, MSG.account.NOT_FOUND);
  return account;
};
