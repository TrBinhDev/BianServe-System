import { Router, IRouter } from "express";
import * as feedbacksController from "./feedbacks.controller";
import { authenticate } from "../../shared/middlewares/authenticate";
import { authorize } from "../../shared/middlewares/authorize";

const router: IRouter = Router();

// Public
router.post("/", feedbacksController.createFeedback);

export default router;

export const adminFeedbackRouter: IRouter = Router();

// Admin & Staff xem
adminFeedbackRouter.use(authenticate);
adminFeedbackRouter.get("/", authorize("admin", "staff"), feedbacksController.listFeedbacks);
adminFeedbackRouter.delete("/:id", authorize("admin"), feedbacksController.deleteFeedback);