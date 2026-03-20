import { Request, Response, NextFunction } from "express";

export const customError = (message: string, statusCode: number): never => {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  console.error(err.stack);
  res.status(statusCode).json({ message: err.message });
};
