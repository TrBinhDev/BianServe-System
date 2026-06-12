import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../errors/AppError";

interface AuthRequest extends Request {
  user?: { id: string; code: string; role: string };
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError(401, "Unauthorized"));
  }

  const token = authHeader.split(" ")[1];
  try {
    req.user = verifyToken(token) as any;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
};