import { Router, IRouter } from "express";
import * as promotionsController from "./promotions.controller";
import { authenticate } from "../../shared/middlewares/authenticate";
import { authorize } from "../../shared/middlewares/authorize";

const router: IRouter = Router();

// Public
router.post("/apply", promotionsController.applyPromotion);

export default router;

export const adminPromotionRouter: IRouter = Router();

// Admin only
adminPromotionRouter.use(authenticate, authorize("admin"));
adminPromotionRouter.get("/", promotionsController.listPromotions);
adminPromotionRouter.get("/:id", promotionsController.getPromotionById);
adminPromotionRouter.post("/", promotionsController.createPromotion);
adminPromotionRouter.put("/:id", promotionsController.updatePromotion);
adminPromotionRouter.delete("/:id", promotionsController.deletePromotion);