import { Router } from "express";
import { send_otp, verify_otp , forgot_send_otp } from "../controllers/MailControllers.js";

export const mailRoutes = Router();

mailRoutes.post("/verify-otp",verify_otp);
mailRoutes.post("/send-otp",send_otp);
mailRoutes.post("/send-forgot-otp",forgot_send_otp);
