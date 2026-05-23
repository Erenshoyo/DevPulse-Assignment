import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.routes";
import { issueRoutes } from "./modules/issues/issues.routes";
import sendResponse from "./utils/response";
import globalErrorHandler from "./middleware/error.middleware";

const app = express();


app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.use(`/api/auth`, authRoutes);
app.use(`/api/issues`, issueRoutes);


app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Server is running",
  });
});

app.use(globalErrorHandler);

export default app;
