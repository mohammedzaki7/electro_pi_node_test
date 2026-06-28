import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { loginValidator, registerValidator } from "./auth.validators";

const router = Router();
const controller = new AuthController();

router.post(
  "/register",
  validate(registerValidator),
  asyncHandler(controller.register),
);

router.post("/login", validate(loginValidator), asyncHandler(controller.login));

export default router;
