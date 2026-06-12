import { Router, IRouter } from "express";
import * as productsController from "./products.controller";
import { authenticate } from "../../shared/middlewares/authenticate";
import { authorize } from "../../shared/middlewares/authorize";

const router: IRouter = Router();

router.use(authenticate, authorize("admin"));

router.get("/", productsController.listProducts);
router.get("/:id", productsController.getProductById);
router.post("/", productsController.createProduct);
router.put("/:id", productsController.updateProduct);
router.delete("/:id", productsController.deleteProduct);
router.patch("/:id/availability", productsController.updateAvailability);

export default router;