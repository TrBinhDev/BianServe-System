import { Request, Response, NextFunction } from "express";
import prisma from "../../config/database";
import { AppError } from "../../shared/errors/AppError";
import { MSG } from "../../shared/constants/messages";
import { sendSuccess } from "../../shared/utils/response";
import { generateQRBase64, generateQRBuffer, generateQRPdf } from "./qr.service";

// GET /api/admin/tables/:id/qr — lấy ảnh QR (base64)
export const getQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const table = await prisma.table.findUnique({ where: { id: req.params.id } });
    if (!table) throw new AppError(404, MSG.table.NOT_FOUND);
    sendSuccess(res, { qrCode: table.qrCode }, MSG.qr.GET_SUCCESS);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/tables/:id/qr/regenerate — gen lại QR
export const regenerateQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const table = await prisma.table.findUnique({ where: { id: req.params.id } });
    if (!table) throw new AppError(404, MSG.table.NOT_FOUND);

    const qrCode = await generateQRBase64(table.id);
    await prisma.table.update({ where: { id: table.id }, data: { qrCode } });

    sendSuccess(res, { qrCode }, MSG.qr.REGENERATED);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/tables/:id/qr/download — tải file PNG
export const downloadQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const table = await prisma.table.findUnique({ where: { id: req.params.id } });
    if (!table) throw new AppError(404, MSG.table.NOT_FOUND);

    const buffer = await generateQRBuffer(table.id);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename=qr-table-${table.tableNumber}.png`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/tables/:id/qr/print — xuất PDF
export const printQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const table = await prisma.table.findUnique({ where: { id: req.params.id } });
    if (!table) throw new AppError(404, MSG.table.NOT_FOUND);

    await generateQRPdf(table.id, table.tableNumber, res);
  } catch (err) {
    next(err);
  }
};