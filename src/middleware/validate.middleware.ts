import { NextFunction, Request, Response } from "express";
import { ContextRunner, validationResult } from "express-validator";
import { AppError } from "../utils/app-error";

export function validate(validations: ContextRunner[]) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }

    const details = result.array().map((e) => ({
      field: e.type === "field" ? e.path : e.type,
      message: e.msg,
    }));
    next(AppError.unprocessableEntity("Validation failed", details));
  };
}
