import { Router, IRouter } from "express";
import * as tablesController from "./tables.controller";
import { authenticate } from "../../shared/middlewares/authenticate";
import { authorize } from "../../shared/middlewares/authorize";

const router: IRouter = Router();

router.use(authenticate, authorize("admin"));

router.get("/", tablesController.listTables);
router.get("/:id", tablesController.getTableById);
router.post("/", tablesController.createTable);
router.put("/:id", tablesController.updateTable);
router.delete("/:id", tablesController.deleteTable);

export default router;