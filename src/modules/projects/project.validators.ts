import { body, param, query } from "express-validator";
import { ProjectStatus } from "../../entities/project.entity";
import { env } from "../../config/env";

export const listProjectsValidator = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: env.pagination.maxLimit })
    .toInt(),
  query("cursor").optional().isString(),
];

export const projectIdValidator = [
  param("id").isUUID().withMessage("Project id must be a valid UUID"),
];

export const createProjectValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Project title is required")
    .isLength({ min: 1, max: 150 }),
  body("description")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 5000 }),
];

export const updateProjectValidator = [
  param("id").isUUID().withMessage("Project id must be a valid UUID"),
  body("title").optional().trim().isLength({ min: 1, max: 150 }),
  body("description")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 5000 }),
  body("status")
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage(
      `status must be one of: ${Object.values(ProjectStatus).join(", ")}`,
    ),
];
