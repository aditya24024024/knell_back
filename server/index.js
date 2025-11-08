// --- top of file ---
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/AuthRoutes.js";
import { gigsRoutes } from "./routes/GigsRoutes.js";
import { orderRoutes } from "./routes/OrderRoutes.js";
import { messageRoutes } from "./routes/MessagesRoutes.js";
import { dashboardRoutes } from "./routes/DashboardRoutes.js";
import { mailRoutes } from "./routes/MailRoutes.js";
import { currencyMiddleware } from "./middlewares/currencyMiddleware.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// Allowed origins
const allowedOrigins = [
  "https://knell.co.in",
  "https://www.knell.co.in",
  "http://localhost:3000"
];

// === CORS & Preflight handler (MUST be before routes) ===
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // required for cookies
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // allow the headers your frontend will send
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie"
  );
  // include OPTIONS in allowed methods for preflight
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  // quick handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// then body parsing and cookie parser
app.use(express.json());
app.use(cookieParser());

// currency middleware (optional) — after CORS so req.currency is available to routes
app.use(currencyMiddleware);

// static folders and routes
app.use("/uploads", express.static("uploads"));
app.use("/uploads/profiles", express.static("uploads/profiles"));

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/otp", mailRoutes);

// socket.io should also be configured with CORS allowedOrigins
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("join", (userId) => socket.join(userId.toString()));
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
