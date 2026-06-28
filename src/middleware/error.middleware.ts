import { NextFunction, Request, Response } from "express";
import { EntityNotFoundError, QueryFailedError, TypeORMError } from "typeorm";
import { AppError } from "../utils/app-error";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Application level errors (validation, auth, etc.)
  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json({ error: { message: err.message, details: err.details } });
    return;
  }

  // Database duplicate key error, using PostgreSQL error code 23505
  if (
    err instanceof QueryFailedError &&
    (err as { code?: string }).code === "23505"
  ) {
    res
      .status(409)
      .json({ error: { message: "Already exists", details: err.message } });
    return;
  }

  // Database entity not found error
  if (err instanceof EntityNotFoundError) {
    res
      .status(404)
      .json({ error: { message: "Resource not found", details: err.message } });
    return;
  }

  // Other database errors (connection issues, etc.)
  if (err instanceof TypeORMError) {
    console.error(err);
    res
      .status(503)
      .json({
        error: { message: "Database unavailable", details: err.message },
      });
    return;
  }

  // Fallback for unhandled errors
  const detail = err instanceof Error ? err.message : String(err);
  console.error(err);
  res
    .status(500)
    .json({ error: { message: "Internal server error", details: detail } });
}
