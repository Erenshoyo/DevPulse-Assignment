import { Pool } from "pg";
import config from "../config";

const pool = new Pool({
  connectionString: config.connection_string,
});

export default pool;