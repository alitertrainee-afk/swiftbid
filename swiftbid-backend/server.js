import cluster from "cluster";
import os from "os";
import dotenv from "dotenv";

dotenv.config();

// Variable to hold the io instance (only defined in workers)
let io;

if (cluster.isPrimary) {
  /**
   * 🧠 PRIMARY PROCESS — The Traffic Cop
   *
   * This process does NOT handle any HTTP or WebSocket traffic.
   * It forks one worker per CPU core and monitors them.
   */
  const numCPUs = os.cpus().length;

  console.log(`🧠 Primary process ${process.pid} is running`);
  console.log(`🔀 Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // If a worker dies, log it and spin up a replacement
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `💀 Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`,
    );
    cluster.fork();
  });
} else {
  /**
   * ⚙️ WORKER PROCESS — Handles actual traffic
   *
   * Each worker gets its own HTTP server, Socket.io instance, and DB connection.
   */
  const { default: app } = await import("./src/app.js");
  const { createServer } = await import("http");
  const { Server } = await import("socket.io");
  const { default: connectDB } = await import("./src/config/database.js");
  const { createClient } = await import("redis");
  const { createAdapter } = await import("@socket.io/redis-adapter");

  const PORT = process.env.PORT;

  // 1️⃣ Create an explicit HTTP server from the Express app
  const httpServer = createServer(app);

  // 2️⃣ Attach Socket.io to the HTTP server with CORS config
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // 3️⃣ Connect Redis Pub/Sub adapter for cross-worker broadcasting
  const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
  const pubClient = createClient({ url: REDIS_URL });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  console.log(`🔴 Redis adapter connected (Worker ${process.pid})`);

  // 4️⃣ Listen for new WebSocket connections
  io.on("connection", (socket) => {
    console.log(`⚡ Client connected: ${socket.id} (Worker ${process.pid})`);

    // Join a room scoped to a specific event
    socket.on("joinEvent", (eventId) => {
      socket.join(eventId);
      console.log(`🚪 Socket ${socket.id} joined room: ${eventId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  // 5️⃣ Connect to DB, then start the HTTP server
  connectDB().then(() => {
    httpServer.listen(PORT, () => {
      console.log(`⚙️ Worker ${process.pid} is running on port ${PORT}`);
    });
  });
}

// Export io so other modules can emit events
export { io };
