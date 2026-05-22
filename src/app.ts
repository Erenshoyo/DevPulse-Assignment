import express, { type Request, type Response } from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes";
import { issueRoutes } from "./modules/issues/issues.routes";
import sendResponse from "./utils/response";
import globalErrorHandler from "./middleware/error.middleware";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(`/api/auth`, authRoutes);
app.use(`/api/issues`, issueRoutes);

// Health check
app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Server is running",
  });
});

// Global error handler (must be after all routes)
app.use(globalErrorHandler);

export default app;
