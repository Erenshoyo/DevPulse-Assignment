import express from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { issueRoutes } from "./modules/issues/issues.routes";


const app = express();
app.use(express.json());

app.use(`/api/auth`, authRoutes);
app.use(`/api/issues`, issueRoutes);

export default app;
