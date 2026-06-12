import { Router, IRouter } from "express";
import * as categoriesController from "./categories.controller";
import { authenticate } from "../../shared/middlewares/authenticate";
import { authorize } from "../../shared/middlewares/authorize";

const router: IRouter = Router();

router.use(authenticate, authorize("admin"));

router.get("/", categoriesController.listCategories);
router.post("/", categoriesController.createCategory);
router.put("/:id", categoriesController.updateCategory);
router.delete("/:id", categoriesController.deleteCategory);

export default router;