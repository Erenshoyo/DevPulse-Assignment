import pool from "../../db/db";
import type {
  ICreateIssue,
  IIssue,
  IQueryIssue,
  IUpdateIssue,
} from "./issues.interface";

const getReporter = async (reporterId: number) => {
  const result = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [reporterId],
  );
  const reporter = result.rows[0];
  return reporter;
};

const createIssueInDB = async (
  payLoad: ICreateIssue,
  userId: number,
): Promise<IIssue> => {
  const { title, description, type } = payLoad;

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id) VALUES($1, $2, $3, $4)RETURNING *;`,
    [title, description, type, userId],
  );

  const issue = result.rows[0];
  return issue;
};

const getAllIssuesFromDB = async (query: IQueryIssue) => {
  const { sort = "newest", type, status } = query;

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (type) {
    conditions.push(`type = $${paramIndex++}`);
    values.push(type);
  }

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  let whereClause = "";

  if (type && status) {
    whereClause = `WHERE type = $1 AND status = $2`;
  } else if (type) {
    whereClause = `WHERE type = $1`;
  } else if (status) {
    whereClause = `WHERE status = $1`;
  }

  const sorting =
    sort === "oldest" ? `ORDER BY created_at ASC` : `ORDER BY created_at DESC`;

  const result = await pool.query(
    `SELECT * FROM issues ${whereClause} ${sorting}`,
  );

  const allUsers = result.rows;
  return allUsers;
};

const getSingleIssueFromDB = async (id: number) => {
  const result = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  const singleUser = result.rows[0];
  return singleUser;
};

const updateIssueInDB = async (id: number, payload: IUpdateIssue) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `UPDATE issues
        SET title = $1,
            description = $2,
            type = $3,
            status = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING *`,
    [title, description, type, status, id],
  );
  const updatedUser = result.rows[0];
  return updatedUser;
};

const deleteUserFromDB = async (id: number) => {
  const result = await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
  return result;
};

export const issusServices = {
  getReporter,
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  deleteUserFromDB,
};
