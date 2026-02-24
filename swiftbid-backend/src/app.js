// libs import
import express from "express";

// routes import
import eventRoutes from "./routes/event.routes.js";
import questionRoutes from "./routes/question.routes.js";

// initialize the express
const app = express();

// Middleware
app.use(express.json());

// Route Mounting
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/questions", questionRoutes);

// Health check route to verify the server is alive
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

export default app;
