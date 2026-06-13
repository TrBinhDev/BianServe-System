import { Request, Response, NextFunction } from 'express';
import * as promotionsService from './promotions.service';
import {
  createPromotionSchema,
  updatePromotionSchema,
  applyPromotionSchema,
  listPromotionsSchema,
} from './promotions.schema';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { MSG } from '../../shared/constants/messages';

export const listActivePromotions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await promotionsService.listActivePromotions();
    sendSuccess(res, data, MSG.promotion.LIST_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const createPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createPromotionSchema.parse(req.body);
    const data = await promotionsService.createPromotion(input);
    sendCreated(res, data, MSG.promotion.CREATED);
  } catch (err) {
    next(err);
  }
};

export const listPromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listPromotionsSchema.parse(req.query);
    const data = await promotionsService.listPromotions(query);
    sendSuccess(res, data, MSG.promotion.LIST_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const getPromotionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await promotionsService.getPromotionById(req.params.id);
    sendSuccess(res, data, MSG.promotion.DETAIL_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const updatePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updatePromotionSchema.parse(req.body);
    const data = await promotionsService.updatePromotion(req.params.id, input);
    sendSuccess(res, data, MSG.promotion.UPDATED);
  } catch (err) {
    next(err);
  }
};

export const deletePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await promotionsService.deletePromotion(req.params.id);
    sendSuccess(res, null, MSG.promotion.DELETED);
  } catch (err) {
    next(err);
  }
};

export const applyPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = applyPromotionSchema.parse(req.body);
    const data = await promotionsService.applyPromotion(input);
    sendSuccess(res, data, MSG.promotion.APPLIED);
  } catch (err) {
    next(err);
  }
};
