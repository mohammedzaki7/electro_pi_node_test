import { Router } from "express";
import { ProjectController } from "./project.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  createProjectValidator,
  listProjectsValidator,
  projectIdValidator,
  updateProjectValidator,
} from "./project.validators";

const router = Router();
const controller = new ProjectController();

router.use(authenticate);

router
  .route("/")
  .get(validate(listProjectsValidator), asyncHandler(controller.list))
  .post(validate(createProjectValidator), asyncHandler(controller.create));

router
  .route("/:id")
  .get(validate(projectIdValidator), asyncHandler(controller.getOne))
  .patch(validate(updateProjectValidator), asyncHandler(controller.update))
  .delete(validate(projectIdValidator), asyncHandler(controller.remove));

export default router;
