import nodemailer from "nodemailer";
import { config } from "../envconfig.js";
import { verificationEmailTemplate } from "../utils/emailTemplate.js";

// DEV EMAIL TRANSPORT (NODEMAILER)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// BREVO EMAIL API (PRODUCTION)
const sendEmail = async ({ to, subject, html, text }) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": config.brevoApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "daya",
        email: config.emailFrom,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Brevo error: ${res.status}`);
  }

  console.log(`Brevo sent — messageId: ${data.messageId}`);
  return data;
};

// SECURITY CODE EMAIL (RESET / DELETE)
export const sendSecurityCode = async (user, code, type) => {
  try {
    await sendEmail({
      to: user.email,
      subject:
        type === "password"
          ? "Password Reset Code — EKOMERS"
          : "Account Deletion Code — EKOMERS",
      text: `Your security code is: ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 40px; background: #0a0a0a; color: #fff; border-radius: 16px; text-align: center;">
          <h2 style="font-style: italic; text-transform: uppercase; letter-spacing: -1px;">Security Code</h2>
          <p style="color: #aaa; font-size: 13px;">
            Use this code to ${type === "password" ? "reset your password" : "delete your account"}.
            It expires in <strong>10 minutes</strong>.
          </p>
          <div style="font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #fff; background: #1a1a1a; padding: 24px; border-radius: 12px; margin: 24px 0;">
            ${code}
          </div>
          <p style="color: #555; font-size: 11px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    console.log("Security code sent to:", user.email);
    return true;
  } catch (error) {
    console.error("Security code email failed:", error.message);
    return false;
  }
};

// EMAIL VERIFICATION
export const sendVerificationEmail = async ({ user, token }) => {
  const verificationUrl = `${config.clientUrl}/verify-email/${token}`;

  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    try {
      const email = user?.email;

      if (!email) {
        throw new Error("sendVerificationEmail: missing user.email");
      }

      await transporter.sendMail({
        from: `"Daya Dev" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email — DAYA (DEV)",
        html: `
        <h2>Verify Your Email</h2>
        <p>Click below:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
      });

      console.log("Dev email sent:", email);
      return true;
    } catch (error) {
      console.error("Nodemailer error:", error.message);
      return false;
    }
  }

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify Your Email — DAYA",
      html: verificationEmailTemplate(user.username, verificationUrl),
    });

    return true;
  } catch (error) {
    console.error("Brevo error:", error.message);
    return false;
  }
};
