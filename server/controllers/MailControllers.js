import nodemailer from "nodemailer";
import crypto from "crypto";
import prisma from "../Prisma_client.js";
import { genSalt, hash } from "bcrypt";
import { Resend } from 'resend';
import redis from "../redis.js";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail(to, otp) {
  try {
    const data = await resend.emails.send({
      // from: 'Your App <onboarding@resend.dev>', // or your verified domain
      from: 'Knell <no-reply@knell.co.in>',
      to: to,
      subject: 'Your Knell signup OTP',
      html: ` <style>
    body { margin:0; padding:0; background:#0f172a; -webkit-text-size-adjust:100%; }
    table { border-collapse:collapse; }
    .email-container { width:100%; max-width:600px; margin:0 auto; background:#0f172a; border-radius:8px; overflow:hidden; }
    .content { padding:28px; font-family:"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; color:#ffffff; font-size:16px; line-height:1.5; }
    .brand { font-weight:700; font-size:20px; color:#ffffff; }
    .otp-box { display:inline-block; margin:18px 0; padding:14px 22px; border-radius:8px; background:#1f2937; color:#ffffff; font-weight:700; font-size:22px; letter-spacing:4px; font-family:"Courier New",Courier,monospace; }
    .note { color:#ffffff; font-size:14px; opacity:0.85; }
    .button { display:inline-block; padding:10px 18px; border-radius:6px; background:#10b981; color:#ffffff; font-weight:600; text-decoration:none; }
    @media (max-width:420px){
      .content { padding:18px; font-size:15px; }
      .otp-box { font-size:20px; padding:12px 18px; }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a; padding:30px 16px;">
    <tr>
      <td align="center">

        <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" width="100%">

          <tr>
            <td class="content">
              <p>Your Knell Sign-Up code is:</p>

              <div class="otp-box">
                <strong>${otp}</strong>
              </div>

              <p>Enter this OTP to complete your Sign-Up process.</p>

              <p class="note">
                This code is valid for <strong>5 minutes</strong>.
              </p>

              <p class="note">
                If you didn’t request this, please ignore the message.
              </p>
              
              <p style="margin-top:24px;">– Team Knell 🟢</p>
            </td>
          </tr>
      </td>
    </tr>
  </table>
</body>`,
    });
    // console.log('Email sent:', data);
  } catch (error) {
    console.error('Resend Error:', error);
  }
}


const generatePassword = async (password) => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};

export const send_mail = async (to) => {
  try {
    const data = await resend.emails.send({
      from: 'Knell <no-reply@knell.co.in>',
      to: to,
      subject: 'You received a new booking',
      html: `  <style>
    body {
      margin: 0;
      padding: 40px 20px;
      background: #0f172a; /* dark background */
      color: #ffffff;      /* white text */
      font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
    }
    .highlight {
      display: inline-block;
      padding: 12px 20px;
      background: #1f2937;
      border-radius: 8px;
      font-weight: 700;
      font-size: 18px;
      color: #ffffff;
    }
    a {
      color: #ffffff;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <p class="highlight">🎉 You’ve received a new booking on Knell!</p>

  <p>Check your seller dashboard to see more details.</p>

  <p>- Team Knell</p>
</body>`,
    });
    // console.log('Email sent:', data);
  } catch (error) {
    console.error('Resend Error:', error);
  }
};

export const accept_mail = async (to) => {
  try {
    const data = await resend.emails.send({
      from: 'Knell <no-reply@knell.co.in>',
      to: to,
      subject: 'Your request got accepted',
      html: `<style>
    body {
      margin: 0;
      padding: 40px 20px;
      background: #0f172a; /* dark background */
      color: #ffffff;      /* white text */
      font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
    }
    .highlight {
      display: inline-block;
      padding: 12px 20px;
      background: #1f2937;
      border-radius: 8px;
      font-weight: 700;
      font-size: 18px;
      color: #ffffff;
    }
  </style>
</head>
<body>
  <p class="highlight">🎉 Your request got accepted!</p>

  <p>Check your buyer dashboard to see more details.</p>

  <p>- Team Knell</p>
</body>`,
    });
    // console.log('Email sent:', data);
  } catch (error) {
    console.error('Resend Error:', error);
  }
};

async function sendResetOtpEmail(to, otp) {
   try {
    const data = await resend.emails.send({
      from: 'Knell <no-reply@knell.co.in>',
      to: to,
      subject: 'Your Password Reset OTP',
      html: ` <style>
    body {
      margin: 0;
      padding: 40px 20px;
      background: #0f172a; /* dark background */
      color: #ffffff;      /* white text */
      font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
    }
    .otp {
      display: inline-block;
      margin: 16px 0;
      padding: 14px 24px;
      background: #1f2937;
      border-radius: 8px;
      font-weight: 700;
      font-size: 22px;
      letter-spacing: 3px;
      font-family: "Courier New", Courier, monospace;
      color: #ffffff;
    }
    a {
      color: #ffffff;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <p>Dear user,</p>

  <p>We received a request to reset the password of your Knell account.</p>

  <p>Here's your OTP 👉 <span class="otp">${otp}</span></p>

  <p>Warm regards,<br>
  Team Knell</p>

  <p>Visit <a href="https://www.knell.co.in" target="_blank">www.knell.co.in</a></p>
</body>`,
    });
    // console.log('Email sent:', data);
  } catch (error) {
    console.error('Resend Error:', error);
  }
}

export const send_otp = async (req, res) => {
  const { email, password } = req.body;
  const otp = crypto.randomInt(100000, 999999).toString();

  try {

    const existing_user = await prisma.user.findUnique({
      where: { email },
    });
    if (existing_user) {
      return res.status(501).send("User already exist.");
    }
    
    await redis.set(
      `otp:${email}`,
      JSON.stringify({
        email,
        password: await generatePassword(password),
        code: otp,
      }),
      "EX",
      300
    );
    await sendOtpEmail(email, otp);
    return res.status(200).json({
      user: {email:email },
    });
  } catch (error) {
    console.error("Failed to send OTP:", error);
    res.status(500).json("Error sending OTP");
  }
};

export const forgot_send_otp = async (req, res) => {
  const { email, password } = req.body;
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = Date.now() + 5 * 60 * 1000;

  try {

    const existing_user = await prisma.user.findUnique({
      where: { email },
    });
    if (!existing_user) {
      return res.status(501).send("User does not exist.");
    }
    await redis.set(
      `otp:${email}`,
      JSON.stringify({
        email,
        password: await generatePassword(password),
        code: otp,
      }),
      "EX",
      300
    );
    await sendResetOtpEmail(email, otp);
    return res.status(200).json({
      user: { email: existing_user.email },
    });
  } catch (error) {
    console.error("Failed to send OTP:", error);
    res.status(500).json("Error sending OTP");
  }
};

export const verify_otp = async (req, res) => {
  const { email, otp } = req.body;
  const dataa = await redis.get(`otp:${email}`);

  if (!dataa) {
    return res.status(400).json("OTP not found. Please try again.");
  }

  const { code: savedOtp } = JSON.parse(dataa);
  if (savedOtp !== otp) {
    return res.status(402).json("Invalid OTP");
  }
  await redis.del(`otp:${email}`);
  return res.status(200).json(JSON.parse(dataa));
};
