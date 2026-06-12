import { Request, Response, NextFunction } from "express";
import * as categoriesService from "./categories.service";
import { createCategorySchema, updateCategorySchema } from "./categories.schema";
import { sendSuccess, sendCreated } from "../../shared/utils/response";
import { MSG } from "../../shared/constants/messages";

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createCategorySchema.parse(req.body);
    const data = await categoriesService.createCategory(input);
    sendCreated(res, data, MSG.category.CREATED);
  } catch (err) {
    next(err);
  }
};

export const listCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await categoriesService.listCategories();
    sendSuccess(res, data, MSG.category.LIST_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateCategorySchema.parse(req.body);
    const data = await categoriesService.updateCategory(req.params.id, input);
    sendSuccess(res, data, MSG.category.UPDATED);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await categoriesService.deleteCategory(req.params.id);
    sendSuccess(res, null, MSG.category.DELETED);
  } catch (err) {
    next(err);
  }
};