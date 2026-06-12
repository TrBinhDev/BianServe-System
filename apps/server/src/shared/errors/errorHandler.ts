import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from './AppError';
import { MSG } from '../constants/messages';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: MSG.common.VALIDATION_ERROR,
      errors: err.issues.map((e: ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: MSG.common.DATA_EXISTS,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: MSG.common.NOT_FOUND,
      });
    }
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: MSG.common.INTERNAL_ERROR,
  });
};
