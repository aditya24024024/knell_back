import nodemailer from "nodemailer";
import crypto from "crypto";
import prisma from "../Prisma_client.js";
import { genSalt, hash } from "bcrypt";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail(to, otp) {
  try {
    const data = await resend.emails.send({
      // from: 'Your App <onboarding@resend.dev>', // or your verified domain
      from: 'Knell <no-reply@knell.co.in>',
      to: to,
      subject: 'Your OTP Code',
      html: ` <style>
    /* Basic mobile-friendly resets (some clients ignore these) */
    body { margin: 0; padding: 0; background-color: #f4f6f8; -webkit-text-size-adjust: 100%; }
    table { border-collapse: collapse; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    a { color: inherit; text-decoration: none; }
    /* Container */
    .email-container { width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
    .spacer { height: 24px; }
    .content { padding: 28px; font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111827; font-size: 16px; line-height: 1.45; }
    .preheader { display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; }
    .brand { font-weight: 700; color: #0f172a; font-size: 20px; }
    .otp-box { display: inline-block; margin: 18px 0; padding: 14px 22px; border-radius: 8px; background: #f3f4f6; font-weight: 700; font-size: 22px; letter-spacing: 4px; font-family: "Courier New", Courier, monospace; }
    .note { color: #6b7280; font-size: 14px; }
    .footer { padding: 20px 28px; font-size: 13px; color: #9ca3af; text-align: center; }
    .button { display:inline-block; padding: 10px 18px; border-radius: 6px; background: #10b981; color: white; font-weight: 600; }
    @media (max-width: 420px) {
      .content { padding: 18px; font-size: 15px; }
      .otp-box { font-size: 20px; padding: 12px 18px; }
    }
  </style>
</head>
<body>
  <!-- Preheader (visible in inbox preview) -->
  <div class="preheader">Enter this OTP to complete your Knell sign-up — code valid for 5 minutes.</div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 30px 16px;">
    <tr>
      <td align="center">

        <!-- Email container -->
        <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" width="100%">
          <!-- Header / Brand -->
          <tr>
            <td style="background:#0f172a; color: #ffffff; padding: 12px 24px; text-align: left;">
              <!-- You can replace this text with an <img> logo if you have one -->
              <span class="brand">Knell <span aria-hidden="true">🟢</span></span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="content">
              <p style="margin:0 0 12px 0;">Your Knell Sign-Up code is:</p>

              <!-- OTP box (uses the placeholder provided by you) -->
              <div role="text" aria-label="One time passcode" class="otp-box">
                <strong>${otp}</strong>
              </div>

              <p style="margin: 8px 0 18px 0;">Enter this OTP to complete your Sign-Up process.</p>

              <p class="note" style="margin:0 0 12px 0;">
                This code is valid for <strong>5 minutes</strong>.
              </p>

              <p class="note" style="margin:0 0 20px 0;">
                If you didn’t request this, please ignore the message.
              </p>
              <p class="note" style="margin:0;">– Team Knell <span aria-hidden="true">🟢</span></p>
            </td>
          </tr>
      </td>
    </tr>
  </table>
</body>`,
    });
    console.log('Email sent:', data);
  } catch (error) {
    console.error('Resend Error:', error);
  }
}


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

// async function sendOtpEmail(to, otp) {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject: "Your Knell Sign-Up OTP",
//     text: `Your Knell Sign-Up code is: ${otp}

// Enter this OTP to complete your Sign-Up process.

// This code is valid for 5 minutes.

// If you didn’t request this, please ignore the message.

// – Team Knell 🟢`,
//   };
//   await transporter.sendMail(mailOptions);
// }

async function sendResetOtpEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Knell Sign-Up OTP",
//     text: `Dear user,

// We received a request to reset the password of your Knell account.

// Here's your OTP 👉 ${otp}

// WARM REGARDS,
// TEAM KNELL
// href{www.knell.co.in}
    html: `
    <p>Dear user,</p>
    <p>We received a request to reset the password of your Knell account.</p>
    <p><strong>Here's your OTP 👉 ${otp}</strong></p>
    <p>Warm regards,<br>Team Knell</p>
    <p>Visit<a href="https://www.knell.co.in" target="_blank"> www.knell.co.in</a></p>
  `
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
      await sendResetOtpEmail(email, otp);
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
    await sendResetOtpEmail(email, otp);
    return res.status(200).json({
      user: { id: user.id, email: user.email },
    });
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
