// express app
import app from "./src/app.js";

// libs import
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

// configs import
import connectDB from "./src/config/database.js";

dotenv.config();

const PORT = process.env.PORT;

// 1️⃣ Create an explicit HTTP server from the Express app
const httpServer = createServer(app);

// 2️⃣ Attach Socket.io to the HTTP server with CORS config
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// 3️⃣ Listen for new WebSocket connections
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// 4️⃣ Connect to DB, then start the HTTP server (not app.listen)
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

// Export io so other modules can emit events
export { io };
