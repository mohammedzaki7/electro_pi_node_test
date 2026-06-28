import { NextFunction, Request, Response, RequestHandler } from "express";

// Wraps an async route handler so that any rejected promise is forwarded to the
// Express error-handling middleware

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
