import { body, param, query } from "express-validator";
import { env } from "../../config/env";
import { TaskStatus } from "../../entities/task.entity";

const statusValues = Object.values(TaskStatus);

export const listTasksValidator = [
  param("projectId").isUUID().withMessage("projectId must be a valid UUID"),
  query("limit").optional().isInt({ min: 1, max: env.pagination.maxLimit }).toInt(),
  query("cursor").optional().isString(),
];

export const taskParamsValidator = [
  param("projectId").isUUID().withMessage("projectId must be a valid UUID"),
  param("taskId").isUUID().withMessage("taskId must be a valid UUID"),
];

export const createTaskValidator = [
  param("projectId").isUUID().withMessage("projectId must be a valid UUID"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 }),
  body("description")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 5000 }),
  body("status")
    .optional()
    .isIn(statusValues)
    .withMessage(`status must be one of: ${statusValues.join(", ")}`),
  body("priority")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("priority must be a positive integer"),
  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("dueDate must be an ISO-8601 date"),
];

export const updateTaskValidator = [
  param("projectId").isUUID().withMessage("projectId must be a valid UUID"),
  param("taskId").isUUID().withMessage("taskId must be a valid UUID"),
  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("description")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 5000 }),
  body("status")
    .optional()
    .isIn(statusValues)
    .withMessage(`status must be one of: ${statusValues.join(", ")}`),
  body("priority")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("priority must be a positive integer"),
  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("dueDate must be an ISO-8601 date"),
];
