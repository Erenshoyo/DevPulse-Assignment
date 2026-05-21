import express, { response, type Request, type Response } from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { issueRoutes } from "./modules/issues/issues.routes";
import sendResponse from "./utils/response";

const app = express();
app.use(express.json());

app.use(`/api/auth`, authRoutes);
app.use(`/api/issues`, issueRoutes);

app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Server is running",
  });
});

export default app;
