import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post(`/signup`, authController.signUpUser);
router.post(`/login`, authController.loginUser);
router.post(`/refresh`, authController.refreshToken);

export const authRoutes = router;
