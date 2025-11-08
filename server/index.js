import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/AuthRoutes.js";
import { gigsRoutes } from "./routes/GigsRoutes.js";
import { orderRoutes } from "./routes/OrderRoutes.js";
import { messageRoutes } from "./routes/MessagesRoutes.js";
import { dashboardRoutes } from "./routes/DashboardRoutes.js";
import { mailRoutes } from "./routes/MailRoutes.js";
import { detectCurrency } from "./middlewares/currencyMiddleware.js"; // ✅ renamed correctly

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.PUBLIC_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    console.log(`User ${userId} joined their room`);
    socket.join(userId.toString());
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: [process.env.PUBLIC_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// ✅ Add this middleware before routes (so all routes get currency info)

app.use(currencyMiddleware);

app.use("/uploads", express.static("uploads"));
app.use("/uploads/profiles", express.static("uploads/profiles"));

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/otp", mailRoutes);

// ✅ Optional endpoint for testing currency detection
app.get("/api/currency", (req, res) => {
  res.json(req.currency);
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
