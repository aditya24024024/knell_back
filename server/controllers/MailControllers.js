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
      html: ` <div class="preheader">Enter this OTP to complete your Knell sign-up — code valid for 5 minutes.</div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 30px 16px;">
    <tr>
      <td align="center">

        <!-- Email container -->
        <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" width="100%">
          <!-- Header / Brand -->
          <tr>
            <td style="background:#0f172a; color: #ffffff; padding: 18px 24px; text-align: left;">
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

              <!-- Optional CTA (visible fallback) -->
              <p style="margin:0;">
                <a href="#" class="button" aria-label="Complete sign up">Complete Sign-Up</a>
              </p>

              <div class="spacer" aria-hidden="true"></div>

              <p class="note" style="margin:0;">– Team Knell <span aria-hidden="true">🟢</span></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer" style="background:#ffffff;">
              <div>Knell • <span>support@knell.example</span></div>
              <div style="margin-top:6px;">Please do not share this code with anyone.</div>
            </td>
          </tr>
        </table>
        <!-- End container -->

      </td>
    </tr>
  </table>`,
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
