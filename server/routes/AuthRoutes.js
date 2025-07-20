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
  deleteUser,
  verifyUser
} from "../controllers/AuthControllers.js";

import { getUserPublicProfile } from "../controllers/UserController.js";
import { storage, profile } from "../cloudinaryConfig.js";
import { verifyToken, verifyAdmin } from "../middlewares/AuthMiddleware.js";

const authRoutes = Router();
const upload = multer({ storage: profile });

// ✅ AUTH ROUTES
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", verifyToken, logout);
authRoutes.post("/get-user-info", verifyToken, getUserInfo);
authRoutes.post("/set-user-info", verifyToken, setUserInfo);
authRoutes.post("/set-user-image", verifyToken, upload.single("images"), setUserImage);

// ✅ ADMIN ROUTES
authRoutes.get("/all-users", verifyAdmin, allUsers);
authRoutes.get("/delete-user", verifyAdmin, deleteUser);
authRoutes.get("/verify-user", verifyAdmin, verifyUser); 
// ✅ fixed here

// ✅ PUBLIC PROFILE
authRoutes.get("/user/:username", getUserPublicProfile);

export default authRoutes;
