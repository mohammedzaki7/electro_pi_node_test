import { Router } from 'express';
import { TaskController } from './task.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler';
import {
  createTaskValidator,
  listTasksValidator,
  taskParamsValidator,
  updateTaskValidator,
} from './task.validators';

// Tasks are nested under a project: /api/projects/:projectId/tasks
const router = Router({ mergeParams: true });
const controller = new TaskController();

router.use(authenticate);

router
  .route('/')
  .get(validate(listTasksValidator), asyncHandler(controller.list))
  .post(validate(createTaskValidator), asyncHandler(controller.create));

router
  .route('/:taskId')
  .get(validate(taskParamsValidator), asyncHandler(controller.getOne))
  .patch(validate(updateTaskValidator), asyncHandler(controller.update))
  .delete(validate(taskParamsValidator), asyncHandler(controller.remove));

export default router;
