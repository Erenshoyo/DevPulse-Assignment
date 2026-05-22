import { StatusCodes } from "http-status-codes";
import pool from "../../db/db";
import { AppError } from "../../utils/appError";
import type {
  ICreateIssue,
  IIssue,
  IQueryIssue,
  IUpdateIssue,
} from "./issues.interface";

const createIssueInDB = async (payLoad: ICreateIssue, userId: number) => {
  const { title, description, type } = payLoad;

  if (!title || !description || !type) {
    throw new AppError(
      "Title, description and type are required",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (title.length > 150) {
    throw new AppError(
      "Title must be 150 characters or less",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (description.length < 20) {
    throw new AppError(
      "Description must be at least 20 characters",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!["bug", "feature_request"].includes(type)) {
    throw new AppError(
      "Type must be bug or feature_request",
      StatusCodes.BAD_REQUEST,
    );
  }

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id) VALUES($1, $2, $3, $4) RETURNING *`,
    [title, description, type, userId],
  );

  const issue = result.rows[0];

  if (!issue) {
    throw new AppError(
      "Issue creation failed",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return issue;
};

const getAllIssuesFromDB = async (query: IQueryIssue) => {
  const { sort = "newest", type, status } = query;

  const conditions: string[] = [];
  const values: string[] = [];
  let paramIndex = 1;

  if (type) {
    conditions.push(`type = $${paramIndex++}`);
    values.push(type);
  }

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sorting =
    sort === "oldest" ? `ORDER BY created_at ASC` : `ORDER BY created_at DESC`;

  const result = await pool.query<IIssue>(
    `SELECT * FROM issues ${whereClause} ${sorting}`,
    values,
  );

  return result.rows;
};

const getSingleIssueFromDB = async (id: number) => {
  const result = await pool.query<IIssue>(
    `SELECT * FROM issues WHERE id = $1`,
    [id],
  );
  return result.rows[0];
};

const updateIssueInDB = async (id: number, payload: IUpdateIssue) => {
  const setInstructions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (payload.title !== undefined) {
    if (payload.title.length > 150) {
      throw new AppError(
        "Title must be 150 characters or less",
        StatusCodes.BAD_REQUEST,
      );
    }
    setInstructions.push(`title = $${paramIndex++}`);
    values.push(payload.title);
  }

  if (payload.description !== undefined) {
    if (payload.description.length < 20) {
      throw new AppError(
        "Description must be at least 20 characters",
        StatusCodes.BAD_REQUEST,
      );
    }
    setInstructions.push(`description = $${paramIndex++}`);
    values.push(payload.description);
  }

  if (payload.type !== undefined) {
    if (!["bug", "feature_request"].includes(payload.type)) {
      throw new AppError(
        "Type must be bug or feature_request",
        StatusCodes.BAD_REQUEST,
      );
    }
    setInstructions.push(`type = $${paramIndex++}`);
    values.push(payload.type);
  }

  if (payload.status !== undefined) {
    if (!["open", "in_progress", "resolved"].includes(payload.status)) {
      throw new AppError(
        "Status must be open, in_progress, or resolved",
        StatusCodes.BAD_REQUEST,
      );
    }
    setInstructions.push(`status = $${paramIndex++}`);
    values.push(payload.status);
  }

  if (setInstructions.length === 0) {
    throw new AppError("No fields to update", StatusCodes.BAD_REQUEST);
  }

  setInstructions.push(`updated_at = NOW()`);

  values.push(id);

  const result = await pool.query(
    `UPDATE issues SET ${setInstructions.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values,
  );

  return result.rows[0];
};

const deleteIssueFromDB = async (id: number) => {
  const result = await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
  return result;
};

export const issueServices = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  deleteIssueFromDB,
};
