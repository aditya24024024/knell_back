import { Router } from "express";
import multer from "multer";

import {
  signup,
  login,
  getUserInfo,
  setUserInfo,
  setUserImage,
  getUserPublicProfile, // Public profile route
} from "../controllers/AuthControllers.js";

import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getUserInfo,setUserInfo,setUserImage } from "../controllers/AuthControllers.js";
import multer from "multer";

// Auth
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);

// Private Profile
authRoutes.post("/get-user-info", verifyToken, getUserInfo);
authRoutes.post("/set-user-info", verifyToken, setUserInfo);
authRoutes.post("/set-user-image", verifyToken, upload.single("images"),setUserImage);

export default authRoutes;
