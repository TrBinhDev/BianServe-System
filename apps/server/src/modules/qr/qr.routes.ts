import { Router, IRouter } from "express";
import * as qrController from "./qr.controller";
import { authenticate } from "../../shared/middlewares/authenticate";
import { authorize } from "../../shared/middlewares/authorize";

const router: IRouter = Router({ mergeParams: true });

router.use(authenticate, authorize("admin"));

router.get("/", qrController.getQR);
router.post("/regenerate", qrController.regenerateQR);
router.get("/download", qrController.downloadQR);
router.get("/print", qrController.printQR);

export default router;