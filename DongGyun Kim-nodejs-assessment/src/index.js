import app from "./server.js";
import connectDB from "./models/db.js";
import logger from "./utils/logger.js";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
});
