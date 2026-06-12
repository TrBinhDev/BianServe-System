import { Router, IRouter } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../shared/middlewares/authenticate";

const router: IRouter = Router();

// Public
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

// Protected
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;