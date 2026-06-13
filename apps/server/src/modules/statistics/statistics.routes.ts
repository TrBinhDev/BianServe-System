import { Router, IRouter } from "express";
import * as statisticsController from "./statistics.controller";
import { authenticate } from "../../shared/middlewares/authenticate";
import { authorize } from "../../shared/middlewares/authorize";

const router: IRouter = Router();

router.use(authenticate);

// Admin & Staff xem
router.get("/dashboard", statisticsController.getDashboard);
router.get("/revenue", statisticsController.getRevenue);
router.get("/orders", statisticsController.getOrderStats);
router.get("/products", statisticsController.getProductStats);
router.get("/tables", statisticsController.getTableStats);
router.get("/promotions", statisticsController.getPromotionStats);

// Admin only export
router.get("/export/revenue", authorize("admin"), statisticsController.exportRevenue);
router.get("/export/orders", authorize("admin"), statisticsController.exportOrders);
router.get("/export/products", authorize("admin"), statisticsController.exportProducts);

export default router;