import { Request, Response, NextFunction } from "express";
import * as statisticsService from "./statistics.service";
import { revenueSchema, dateRangeSchema, exportSchema } from "./statistics.schema";
import { sendSuccess } from "../../shared/utils/response";
import { MSG } from "../../shared/constants/messages";

export const getRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = revenueSchema.parse(req.query);
    const data = await statisticsService.getRevenue(query);
    sendSuccess(res, data, MSG.statistics.SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const getOrderStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = dateRangeSchema.parse(req.query);
    const data = await statisticsService.getOrderStats(query);
    sendSuccess(res, data, MSG.statistics.SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const getProductStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = dateRangeSchema.parse(req.query);
    const data = await statisticsService.getProductStats(query);
    sendSuccess(res, data, MSG.statistics.SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const getTableStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = dateRangeSchema.parse(req.query);
    const data = await statisticsService.getTableStats(query);
    sendSuccess(res, data, MSG.statistics.SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const getPromotionStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = dateRangeSchema.parse(req.query);
    const data = await statisticsService.getPromotionStats(query);
    sendSuccess(res, data, MSG.statistics.SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await statisticsService.getDashboard();
    sendSuccess(res, data, MSG.statistics.SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const exportRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = exportSchema.parse(req.query);
    await statisticsService.exportRevenue(query, res);
  } catch (err) {
    next(err);
  }
};

export const exportOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = exportSchema.parse(req.query);
    await statisticsService.exportOrders(query, res);
  } catch (err) {
    next(err);
  }
};

export const exportProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = exportSchema.parse(req.query);
    await statisticsService.exportProducts(query, res);
  } catch (err) {
    next(err);
  }
};