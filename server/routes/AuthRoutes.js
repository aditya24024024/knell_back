import { Router } from "express";
import multer from "multer";

import {
  signup,
  login,
  logout,
  getUserInfo,
  setUserInfo,
  setUserImage,
  allUsers,
  deleteUser
} from "../controllers/AuthControllers.js";

import { getUserPublicProfile } from "../controllers/UserController.js";
import { storage, profile } from "../cloudinaryConfig.js";
import { verifyToken, verifyAdmin } from "../middlewares/AuthMiddleware.js";

const authRoutes = Router();
const upload = multer({ storage:profile });

// ✅ AUTH ROUTES
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", verifyToken, logout);
authRoutes.post("/get-user-info", verifyToken, getUserInfo);
authRoutes.post("/set-user-info", verifyToken, setUserInfo);
authRoutes.post("/all-users", verifyAdmin, allUsers);
authRoutes.post("/delete-users", verifyAdmin, deleteUser);
authRoutes.post("/set-user-image", verifyToken, upload.single("images"), setUserImage);

// ✅ PUBLIC PROFILE ROUTE (GET)
authRoutes.get("/user/:username", getUserPublicProfile); // <-- ADD THIS

export default authRoutes;
