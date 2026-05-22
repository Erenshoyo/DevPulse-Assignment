import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import sendResponse from "../utils/response";
import { StatusCodes } from "http-status-codes";

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return sendResponse(res, {
      statusCode: err.statusCode,
      success: false,
      message: err.message,
    });
  }

  // Unexpected errors
  return sendResponse(res, {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    success: false,
    message: "Something went wrong",
    errors: err.message || "Internal server error",
  });
};

export default globalErrorHandler;
