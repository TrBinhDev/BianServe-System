import { Request, Response, NextFunction } from "express";
import * as tablesService from "./tables.service";
import { createTableSchema, updateTableSchema, listTablesSchema } from "./tables.schema";
import { sendSuccess, sendCreated } from "../../shared/utils/response";
import { MSG } from "../../shared/constants/messages";

export const createTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createTableSchema.parse(req.body);
    const data = await tablesService.createTable(input);
    sendCreated(res, data, MSG.table.CREATED);
  } catch (err) {
    next(err);
  }
};

export const listTables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listTablesSchema.parse(req.query);
    const data = await tablesService.listTables(query);
    sendSuccess(res, data, MSG.table.LIST_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const getTableById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await tablesService.getTableById(req.params.id);
    sendSuccess(res, data, MSG.table.DETAIL_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const updateTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateTableSchema.parse(req.body);
    const data = await tablesService.updateTable(req.params.id, input);
    sendSuccess(res, data, MSG.table.UPDATED);
  } catch (err) {
    next(err);
  }
};

export const deleteTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await tablesService.deleteTable(req.params.id);
    sendSuccess(res, null, MSG.table.DELETED);
  } catch (err) {
    next(err);
  }
};