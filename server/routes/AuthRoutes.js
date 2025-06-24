import { Router } from "express";
import multer from "multer";

import {
  signup,
  login,
  logout,
  getUserInfo,
  setUserInfo,
  setUserImage,
  getUserPublicProfile, // ✅ IMPORT this controller
} from "../controllers/AuthControllers.js";

import { verifyToken } from "../middlewares/AuthMiddleware.js";

const authRoutes = Router();
const upload = multer({ dest: "uploads/profiles/" });

// ✅ AUTH ROUTES
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", verifyToken, logout);
authRoutes.post("/get-user-info", verifyToken, getUserInfo);
authRoutes.post("/set-user-info", verifyToken, setUserInfo);
authRoutes.post("/set-user-image", verifyToken, upload.single("images"), setUserImage);

// ✅ PUBLIC PROFILE ROUTE (GET)
authRoutes.get("/user/:username", getUserPublicProfile); // <-- ADD THIS

export default authRoutes;
