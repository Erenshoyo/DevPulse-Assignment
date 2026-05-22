import type { ILogin, ISignUp, IUser } from "./auth.interface";
import pool from "../../db/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";

const secret = config.secret;

const signUpToDB = async (payLoad: ISignUp) => {
  try {
    const { name, email, password, role = "contributor" } = payLoad;

    if (!name || !email || !password) {
      throw new Error("Signup credentials required.");
    }

    if (!["contributor", "maintainer"].includes(role)) {
      throw new Error("Roles can only be 'Contributor'/'Maintainer'.");
    }

    const duplicateEmail = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    );

    if (duplicateEmail.rows.length > 0) {
      throw new Error(`Email already registered`);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query<IUser>(
      `INSERT INTO users(name, email, password, role) VALUES ($1,$2,$3,$4)
      RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, role],
    );

    const newUser = result.rows[0];

    if (!newUser) {
      throw new Error("User creation failed.");
    }

    return newUser;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went wrong during login",
    );
  }
};

const loginToDB = async (payLoad: ILogin) => {
  try {
    const { email, password } = payLoad;

    if (!email || !password) {
      throw new Error("Invalid Credentials");
    }

    const result = await pool.query<IUser>(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const passwordVerify = await bcrypt.compare(
      password,
      user?.password as string,
    );

    if (!passwordVerify) {
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
    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went wrong during login",
    );
  }
};

export const authService = {
  signUpToDB,
  loginToDB,
};
