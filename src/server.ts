import app from "./app";
import config from "./config";
import { initDB } from "./db/db";

const PORT = config.port;

const main = () => {
  initDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

main();
