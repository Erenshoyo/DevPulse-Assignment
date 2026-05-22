import type { NextFunction, Request, Response } from "express";
import sendResponse from "../utils/response";
import { StatusCodes } from "http-status-codes";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";

const secret = config.secret;

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return sendResponse(res, {
        statusCode: StatusCodes.UNAUTHORIZED,
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, secret as string) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message:
        error instanceof jwt.TokenExpiredError
          ? "Token has expired."
          : "Invalid token.",
    });
  }
};

const maintainer = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "maintainer") {
    return sendResponse(res, {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Access denied. Maintainers only.",
    });
  }

  next();
};

export const authMiddleware = {
  auth,
  maintainer,
};
