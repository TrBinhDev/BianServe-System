import { Request, Response, NextFunction } from 'express';
import * as ordersService from './orders.service';
import {
  createOrderSchema,
  addItemSchema,
  updateItemSchema,
  cancelOrderSchema,
  updateStatusSchema,
  listOrdersSchema,
} from './orders.schema';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { MSG } from '../../shared/constants/messages';

interface AuthRequest extends Request {
  user?: { id: string; code: string; role: string };
}

// Public
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createOrderSchema.parse(req.body);
    const data = await ordersService.createOrder(input);
    sendCreated(res, data, MSG.order.CREATED);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await ordersService.getOrderById(req.params.id);
    sendSuccess(res, data, MSG.order.DETAIL_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const addItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = addItemSchema.parse(req.body);
    const data = await ordersService.addItem(req.params.id, input);
    sendSuccess(res, data, MSG.order.ITEM_ADDED);
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateItemSchema.parse(req.body);
    const data = await ordersService.updateItem(req.params.id, req.params.itemId, input);
    sendSuccess(res, data, MSG.order.ITEM_UPDATED);
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ordersService.deleteItem(req.params.id, req.params.itemId);
    sendSuccess(res, null, MSG.order.ITEM_DELETED);
  } catch (err) {
    next(err);
  }
};

// Admin/Staff
export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listOrdersSchema.parse(req.query);
    const data = await ordersService.listOrders(query);
    sendSuccess(res, data, MSG.order.LIST_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const getOrderByIdAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await ordersService.getOrderById(req.params.id);
    sendSuccess(res, data, MSG.order.DETAIL_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateStatusSchema.parse(req.body);
    const data = await ordersService.updateStatus(req.params.id, input);
    sendSuccess(res, data, MSG.order.UPDATED);
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const input = cancelOrderSchema.parse(req.body);
    const data = await ordersService.cancelOrder(req.params.id, req.user!.id, input);
    sendSuccess(res, data, MSG.order.CANCELLED);
  } catch (err) {
    next(err);
  }
};
