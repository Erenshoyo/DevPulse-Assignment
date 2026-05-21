import type { Request, Response } from "express";
import type { ILogin, ISignUp, IUser } from "./auth.interface";
import sendResponse from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import pool from "../../db/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";

const secret = config.secret;

const signUpToDB = async (req: Request) => {
  try {
    const { name, email, password, role = "contributor" }: ISignUp = req.body;

    if (!name || !email || !password) {
      // sendResponse(res, {
      //   statusCode: StatusCodes.BAD_REQUEST,
      //   success: false,
      //   message: "Fill up the required fields",
      // });
      throw new Error("Signup credentials required.");
    }

    if (!["contributor", "maintainer"].includes(role)) {
      // sendResponse(res, {
      //   statusCode: StatusCodes.BAD_REQUEST,
      //   success: false,
      //   message: "Not allowed.",
      // });
      throw new Error("Roles can only be 'Contributor'/'Maintainer'.");
    }

    const duplicateEmail = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    );
    if (duplicateEmail.rows.length > 0) {
      // sendResponse(res, {
      //   statusCode: StatusCodes.BAD_REQUEST,
      //   success: false,
      //   message: "Email already registered",
      // });
      throw new Error(`Email already registered`);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query<IUser>(
      `INSERT INTO users(name, email, password, role) VALUES ($1,$2,$3,$4)
      RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, role],
    );

    const newUser = result.rows[0];
    return newUser;
  } catch (error) {
    // sendResponse(res, {
    //   statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    //   success: false,
    //   message: `Something went wrong`,
    //   error: error,
    // });
    throw new Error("Something went wrong");
  }
};

const loginToDB = async (req: Request) => {
  try {
    const { email, password }: ILogin = req.body;

    if (!email || !password) {
      // sendResponse(res, {
      //   statusCode: StatusCodes.BAD_REQUEST,
      //   success: false,
      //   message: "Credentials are needed to login",
      // });
      throw new Error("Invalid Credentials");
    }

    const result = await pool.query<IUser>(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      //   sendResponse(res, {
      //     statusCode: StatusCodes.BAD_REQUEST,
      //     success: false,
      //     message: "Invalid email and password.",
      //   });
      throw new Error("Invalid credentials");
    }

    const passwordVerify = await bcrypt.compare(
      password,
      user?.password as string,
    );

    if (!passwordVerify) {
      // sendResponse(res, {
      //   statusCode: StatusCodes.BAD_REQUEST,
      //   success: false,
      //   message: "Invalid password.",
      // });
      throw new Error("Invalid Password");
    }

    const token = jwt.sign(
      {
        id: user?.id,
        name: user?.name,
        role: user?.role,
      },
      secret as string,
      { expiresIn: "7d" },
    );

    const { password: _password, ...userWithoutPassword } = user;

    const data = { token, user: userWithoutPassword };

    return data;
  } catch (error) {
    // sendResponse(res, {
    //   statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    //   success: false,
    //   message: `Something went wrong`,
    //   error: error,
    // });
    throw new Error("Something went wrong");
  }
};

export const authService = {
  signUpToDB,
  loginToDB,
};
