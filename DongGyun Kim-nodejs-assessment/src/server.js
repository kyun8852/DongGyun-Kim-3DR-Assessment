import express from "express";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

const app = express();
//
app.use(cors());
app.use(express.json());
app.use("/events", eventRoutes);
app.use("/tickets", ticketRoutes);
app.use("/stats", statsRoutes);

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    error: error.message,
    status: error.statusCode || 500,
  });
});

export default app;
