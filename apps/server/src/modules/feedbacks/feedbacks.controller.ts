import { Request, Response, NextFunction } from "express";
import * as feedbacksService from "./feedbacks.service";
import { createFeedbackSchema, listFeedbacksSchema } from "./feedbacks.schema";
import { sendSuccess, sendCreated } from "../../shared/utils/response";
import { MSG } from "../../shared/constants/messages";

export const createFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createFeedbackSchema.parse(req.body);
    const data = await feedbacksService.createFeedback(input);
    sendCreated(res, data, MSG.feedback.CREATED);
  } catch (err) {
    next(err);
  }
};

export const listFeedbacks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listFeedbacksSchema.parse(req.query);
    const data = await feedbacksService.listFeedbacks(query);
    sendSuccess(res, data, MSG.feedback.LIST_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const deleteFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await feedbacksService.deleteFeedback(req.params.id);
    sendSuccess(res, null, MSG.feedback.DELETED);
  } catch (err) {
    next(err);
  }
};