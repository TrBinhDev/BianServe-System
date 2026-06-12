import { Request, Response, NextFunction } from 'express';
import * as accountsService from './accounts.service';
import {
  createAccountSchema,
  changePasswordSchema,
  changeStatusSchema,
  listAccountsSchema,
} from './accounts.schema';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { MSG } from '../../shared/constants/messages';

export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createAccountSchema.parse(req.body);
    const data = await accountsService.createAccount(input);
    sendCreated(res, data, MSG.account.CREATED);
  } catch (err) {
    next(err);
  }
};

export const listAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listAccountsSchema.parse(req.query);
    const data = await accountsService.listAccounts(query);
    sendSuccess(res, data, MSG.account.LIST_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = changePasswordSchema.parse(req.body);
    await accountsService.changePassword(req.params.id, input);
    sendSuccess(res, null, MSG.account.PASSWORD_UPDATED);
  } catch (err) {
    next(err);
  }
};

export const changeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = changeStatusSchema.parse(req.body);
    await accountsService.changeStatus(req.params.id, input);
    sendSuccess(res, null, input.isActive ? MSG.account.UNLOCKED : MSG.account.LOCKED);
  } catch (err) {
    next(err);
  }
};
