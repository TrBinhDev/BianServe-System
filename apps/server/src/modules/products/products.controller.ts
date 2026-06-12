import { Request, Response, NextFunction } from "express";
import * as productsService from "./products.service";
import {
  createProductSchema,
  updateProductSchema,
  availabilitySchema,
  listProductsSchema,
} from "./products.schema";
import { sendSuccess, sendCreated } from "../../shared/utils/response";
import { MSG } from "../../shared/constants/messages";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createProductSchema.parse(req.body);
    const data = await productsService.createProduct(input);
    sendCreated(res, data, MSG.product.CREATED);
  } catch (err) {
    next(err);
  }
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listProductsSchema.parse(req.query);
    const data = await productsService.listProducts(query);
    sendSuccess(res, data, MSG.product.LIST_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productsService.getProductById(req.params.id);
    sendSuccess(res, data, MSG.product.DETAIL_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateProductSchema.parse(req.body);
    const data = await productsService.updateProduct(req.params.id, input);
    sendSuccess(res, data, MSG.product.UPDATED);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productsService.deleteProduct(req.params.id);
    sendSuccess(res, null, MSG.product.DELETED);
  } catch (err) {
    next(err);
  }
};

export const updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = availabilitySchema.parse(req.body);
    const data = await productsService.updateAvailability(req.params.id, input);
    sendSuccess(res, data, MSG.product.AVAILABILITY_UPDATED);
  } catch (err) {
    next(err);
  }
};

export const getMenu = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productsService.getMenu();
    sendSuccess(res, data, MSG.product.MENU_SUCCESS);
  } catch (err) {
    next(err);
  }
};