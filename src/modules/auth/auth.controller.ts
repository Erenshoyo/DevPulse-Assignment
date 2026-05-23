import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/appError";

const signUpUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.signUpToDB(req.body);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return sendResponse(res, {
        statusCode: error.statusCode,
        success: false,
        message: error.message,
      });
    }

    return sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Something went wrong",
      errors: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginToDB(req.body);

    const { refreshToken, accessToken, user } = result.data;

    const token = accessToken;

    res.cookie("refreshToken", refreshToken, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Login successful",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return sendResponse(res, {
        statusCode: error.statusCode,
        success: false,
        message: error.message,
      });
    }

    return sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Something went wrong",
      errors: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken as string;

    const result = await authService.refreshAccessToken(refreshToken);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return sendResponse(res, {
        statusCode: error.statusCode,
        success: false,
        message: error.message,
      });
    }

    return sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Something went wrong",
      errors: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const authController = {
  signUpUser,
  loginUser,
  refreshToken,
};
