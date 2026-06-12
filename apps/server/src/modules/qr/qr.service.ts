import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { Response } from "express";

// Gen QR content URL cho bàn
export const generateQRContent = (tableId: string): string => {
  const baseUrl = process.env.STOREFRONT_URL || "http://localhost:3000";
  return `${baseUrl}/order/${tableId}`;
};

// Gen QR thành base64 PNG để lưu DB
export const generateQRBase64 = async (tableId: string): Promise<string> => {
  const content = generateQRContent(tableId);
  return QRCode.toDataURL(content);
};

// Trả về buffer PNG để download
export const generateQRBuffer = async (tableId: string): Promise<Buffer> => {
  const content = generateQRContent(tableId);
  return QRCode.toBuffer(content);
};

// Xuất PDF để in
export const generateQRPdf = async (tableId: string, tableNumber: string, res: Response) => {
  const content = generateQRContent(tableId);
  const qrBuffer = await QRCode.toBuffer(content, { width: 300 });

  const doc = new PDFDocument({ size: "A6", margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=qr-table-${tableNumber}.pdf`);
  doc.pipe(res);

  doc.fontSize(16).text(`Bàn ${tableNumber}`, { align: "center" });
  doc.moveDown();
  doc.image(qrBuffer, { align: "center", width: 200 });
  doc.moveDown();
  doc.fontSize(10).text("Quét mã QR để đặt món", { align: "center" });

  doc.end();
};