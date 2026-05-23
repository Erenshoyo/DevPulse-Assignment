import type { ILogin, ISignUp, IUser } from "./auth.interface";
import pool from "../../db/db";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { AppError } from "../../utils/appError";
import { StatusCodes } from "http-status-codes";

const secret = config.secret as string;
const refreshSecret = config.refresh_secret as string;

const signUpToDB = async (payLoad: ISignUp) => {
  const { name, email, password, role = "contributor" } = payLoad;

  if (!name || !email || !password) {
    throw new AppError(
      "Name, email and password are required.",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!["contributor", "maintainer"].includes(role)) {
    throw new AppError(
      "Role must be 'contributor' or 'maintainer'.",
      StatusCodes.BAD_REQUEST,
    );
  }

  const duplicateEmail = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [email],
  );

  if (duplicateEmail.rows.length > 0) {
    throw new AppError("Email already registered", StatusCodes.BAD_REQUEST);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query<IUser>(
    `INSERT INTO users(name, email, password, role) VALUES ($1,$2,$3,$4)
      RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role],
  );

  const newUser = result.rows[0];

  if (!newUser) {
    throw new AppError(
      "User creation failed.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return newUser;
};

const createTokenPayload = (user: IUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const signTokens = (payload: Record<string, unknown>) => ({
  accessToken: jwt.sign(payload, secret, { expiresIn: "1d" }),
  refreshToken: jwt.sign(payload, refreshSecret, { expiresIn: "90d" }),
});

const loginToDB = async (payLoad: ILogin) => {
  const { email, password } = payLoad;

  if (!email || !password) {
    throw new AppError(
      "Email and password are required.",
      StatusCodes.BAD_REQUEST,
    );
  }

  const result = await pool.query<IUser>(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError("Invalid credentials", StatusCodes.BAD_REQUEST);
  }

  const passwordVerify = await bcrypt.compare(password, user.password);

  if (!passwordVerify) {
    throw new AppError("Invalid credentials", StatusCodes.BAD_REQUEST);
  }

  const tokens = signTokens(createTokenPayload(user));

  const { password: _password, ...userWithoutPassword } = user;

  return {
    data: {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  };
};

const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", StatusCodes.UNAUTHORIZED);
  }

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(refreshToken, refreshSecret) as JwtPayload;
  } catch (error) {
    throw new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
  }

  const result = await pool.query<IUser>(
    `SELECT * FROM users WHERE id = $1`,
    [decoded.id],
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  if (user.role !== "contributor" && user.role !== "maintainer") {
    throw new AppError("Invalid user role", StatusCodes.UNAUTHORIZED);
  }

  const accessToken = jwt.sign(createTokenPayload(user), secret, {
    expiresIn: "1d",
  });

  return { accessToken };
};

export const authService = {
  signUpToDB,
  loginToDB,
  refreshAccessToken,
};
