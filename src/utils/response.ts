//! Standardized response utility following the assignment spec.

import type { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  errors?: string | Record<string, string>;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  const responseBody: Record<string, unknown> = {
    success: data.success,
    message: data.message,
  };

  if (data.data !== undefined) {
    responseBody.data = data.data;
  }

  if (data.errors !== undefined) {
    responseBody.errors = data.errors;
  }

  res.status(data.statusCode).json(responseBody);
};

export default sendResponse;
