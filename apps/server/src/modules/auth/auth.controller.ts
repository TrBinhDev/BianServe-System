import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { loginSchema, refreshSchema } from './auth.schema';
import { sendSuccess } from '../../shared/utils/response';
import { MSG } from '../../shared/constants/messages';

interface AuthRequest extends Request {
  user?: { id: string; code: string; role: string };
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = loginSchema.parse(req.body);
    const data = await authService.login(input);
    sendSuccess(res, data, MSG.auth.LOGIN_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const data = await authService.refresh(refreshToken);
    sendSuccess(res, data, MSG.auth.TOKEN_REFRESHED);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.user!.id);
    sendSuccess(res, null, MSG.auth.LOGOUT_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await authService.getMe(req.user!.id);
    sendSuccess(res, data, MSG.auth.ME_SUCCESS);
  } catch (err) {
    next(err);
  }
};
