import nodemailer from "nodemailer";
import crypto from "crypto";
import prisma from "../Prisma_client.js";
import { genSalt, hash } from "bcrypt";

const generatePassword = async (password) => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const send_mail = async (to) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "🎉 You’ve received a new booking on Knell!",
    text: `You’ve received a new booking request on Knell!

Check on your seller dashboard to see the order details!`,
  };
  await transporter.sendMail(mailOptions);
};

export const accept_mail = async (to) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "🎉 Your request got accepted!",
    text: `Your request got accepted by the service provider!

Check on your buyer dashboard to see the order details!`,
  };
  await transporter.sendMail(mailOptions);
};

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Knell Sign-Up OTP",
    text: `Your Knell Sign-Up code is: ${otp}

Enter this OTP to complete your Sign-Up process.

This code is valid for 5 minutes.

If you didn’t request this, please ignore the message.

– Team Knell 🟢`,
  };

  await transporter.sendMail(mailOptions);
}

export const send_otp = async (req, res) => {
  const { email, password } = req.body;
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = Date.now() + 5 * 60 * 1000;

  try {

    const existing_user = await prisma.user.findUnique({
      where: { email },
    });

    if (existing_user) {
      return res.status(501).send("User already exist.");
    }
    const unverified_mail = await prisma.otp.findUnique({
      where: { email },
    });

    if (unverified_mail) {
      const user = await prisma.otp.update({
        where: { email },
        data: {
          password: await generatePassword(password),
          code: otp,
          expiresAt: new Date(expires),
        },
      });
      await sendOtpEmail(email, otp);
      return res.status(200).json({
        user: { id: user.id, email: user.email },
      });
    }
    const user = await prisma.otp.create({
      data: {
        email,
        password: await generatePassword(password),
        code: otp,
        expiresAt: new Date(expires),
      },
    });
    await sendOtpEmail(email, otp);
    return res.status(200).json({
      user: { id: user.id, email: user.email },
    });
    // res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    console.error("Failed to send OTP:", error);
    res.status(500).json("Error sending OTP");
  }
};

export const verify_otp = async (req, res) => {
  const { email, otp } = req.body;
  const dataa = await prisma.otp.findUnique({
    where: { email },
  })

  if (!dataa) {
    return res.status(400).json("OTP not found. Please signup again.");
  }

  if (Date.now() > dataa.expiresAt) {
    await prisma.otp.delete({
      where: { email },
    },);
    return res.status(401).json("OTP expired. Please signup again.");
  }

  if (otp !== dataa.code) {
    return res.status(402).json("Invalid OTP");
  }
  await prisma.otp.delete({
    where: { email },
  },);
  return res.status(200).json(dataa);
};
