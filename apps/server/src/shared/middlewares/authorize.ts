import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

interface AuthRequest extends Request {
  user?: { id: string; code: string; role: string };
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, "Forbidden"));
    }
    next();
  };
};