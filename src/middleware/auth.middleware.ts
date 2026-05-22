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
      sendResponse(res, {
        statusCode: StatusCodes.UNAUTHORIZED,
        success: false,
        message: "Access denied!!!",
      });
    }

    const decoded = jwt.verify(token as string, secret as string) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error) {
    sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "Invalid token.",
    });
  }
};

const maintainer = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "maintainer") {
    sendResponse(res, {
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
