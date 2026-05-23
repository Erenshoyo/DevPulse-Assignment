import app from "./app";
import config from "./config";
import { initDB } from "./db/db";

const PORT = config.port;

initDB();

export default app;
