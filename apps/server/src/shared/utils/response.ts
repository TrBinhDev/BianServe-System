import { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendCreated = (res: Response, data: unknown, message = "Created") => {
  return sendSuccess(res, data, message, 201);
};