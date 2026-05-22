import type { Request, Response } from "express";
import { issueServices } from "./issues.service";
import sendResponse from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/appError";
import pool from "../../db/db";
import type { IReporter } from "./issues.interface";

const createIssue = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id as number;
    const result = await issueServices.createIssueInDB(req.body, userId);

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Issue created successfully",
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

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const issues = await issueServices.getAllIssuesFromDB(req.query);

    if (!issues.length) {
      return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "No issues found.",
        data: [],
      });
    }

    const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

    const reporters = await pool.query(
      `SELECT id, name, role FROM users WHERE id = ANY($1)`,
      [reporterIds],
    );

    const reporterMap = new Map<number, IReporter>();
    for (const reporter of reporters.rows) {
      reporterMap.set(reporter.id, reporter);
    }

    const finalIssues = issues.map(({ reporter_id, ...issue }) => ({
      ...issue,
      reporter: reporterMap.get(reporter_id) ?? null,
    }));

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issues fetched successfully",
      data: finalIssues,
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

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const issue = await issueServices.getSingleIssueFromDB(id);

    if (!issue) {
      throw new AppError("Issue not found", StatusCodes.NOT_FOUND);
    }

    const singleReporter = await pool.query(
      `SELECT id, name, role FROM users WHERE id = $1`,
      [issue.reporter_id],
    );

    const reporter = singleReporter.rows[0] ?? null;

    const { reporter_id, ...issueWithoutReporterId } = issue;

    const finalSingleIssue = {
      ...issueWithoutReporterId,
      reporter,
    };

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue fetched successfully",
      data: finalSingleIssue,
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

const updateIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.id as number;
    const userRole = req.user!.role as string;

    const existingIssue = await issueServices.getSingleIssueFromDB(id);

    if (!existingIssue) {
      throw new AppError("Issue not found", StatusCodes.NOT_FOUND);
    }

    if (userRole !== "maintainer") {
      if (existingIssue.reporter_id !== userId) {
        throw new AppError(
          "Access denied. You can only update your own issues.",
          StatusCodes.FORBIDDEN,
        );
      }

      if (existingIssue.status !== "open") {
        throw new AppError(
          "Cannot update issue. Only open issues can be updated by contributors.",
          StatusCodes.CONFLICT,
        );
      }

      if (req.body.status !== undefined) {
        throw new AppError(
          "Contributors cannot change issue status.",
          StatusCodes.FORBIDDEN,
        );
      }
    }

    const result = await issueServices.updateIssueInDB(id, req.body);

    if (!result) {
      throw new AppError("Issue not found", StatusCodes.NOT_FOUND);
    }

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue updated successfully",
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

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await issueServices.deleteIssueFromDB(id);

    if (result.rowCount === 0) {
      throw new AppError("Issue not found", StatusCodes.NOT_FOUND);
    }

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Issue deleted successfully",
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

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
