import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { issueController } from "./issues.controller";

const { auth, maintainer } = authMiddleware;
const { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue } =
  issueController;
const router = Router();

router.post("/", auth, createIssue);
router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);
router.patch("/:id", auth, updateIssue);
router.delete("/:id", auth, maintainer, deleteIssue);

export const issueRoutes = router;
