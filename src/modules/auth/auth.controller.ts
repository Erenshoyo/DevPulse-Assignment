import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/response";
import { StatusCodes } from "http-status-codes";

const signUpUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.signUpToDB(req.body);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    let message = "SignUp failed.";

    if (error instanceof Error) {
      message = error.message;
    }
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: message,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginToDB(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    let message = "Login failed.";

    if (error instanceof Error) {
      message = error.message;
    }
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: message,
    });
  }
};

export const authController = {
  signUpUser,
  loginUser,
};
