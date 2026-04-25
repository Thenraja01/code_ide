import { convex, anyApi } from '../config/convex.js';
import admin from '../firebase/firebase.config.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// ─── Email transporter (Gmail) ───────────────────────────────────────────────
const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,   // Gmail App Password (not your real password)
  },
});

// ─── Update profile ──────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const firebaseUid = req.user.uid;

    // Update display name in Firebase if provided
    if (name) {
      await admin.auth().updateUser(firebaseUid, { displayName: name });
    }

    // Sync to Convex
    await convex.mutation(anyApi.users.updateProfile, {
      firebaseUid,
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(avatar && { avatar }),
    });

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
};

// ─── Send OTP email ──────────────────────────────────────────────────────────
export const sendOtp = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const email = req.user.email;

    if (!email) return res.status(400).json({ error: "No email on account" });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in Convex
    await convex.mutation(anyApi.users.storeOtp, { firebaseUid, otp, expiresAt });

    // Send via Gmail
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"CodeSphere IDE" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your CodeSphere Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f11; color: #e4e4e7; border-radius: 16px;">
          <h2 style="color: #60a5fa; margin-bottom: 8px;">Verify your email</h2>
          <p style="color: #a1a1aa; margin-bottom: 24px;">Enter this code in CodeSphere to verify your email address. It expires in 10 minutes.</p>
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; text-align: center;">
            <span style="font-size: 48px; font-weight: 900; letter-spacing: 16px; color: #ffffff;">${otp}</span>
          </div>
          <p style="color: #52525b; font-size: 12px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send OTP Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to send OTP" });
  }
};

// ─── Verify OTP ──────────────────────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const firebaseUid = req.user.uid;

    if (!otp) return res.status(400).json({ error: "OTP is required" });

    // Verify in Convex (throws on failure)
    await convex.mutation(anyApi.users.verifyOtp, { firebaseUid, otp });

    // Also mark verified in Firebase
    await admin.auth().updateUser(firebaseUid, { emailVerified: true });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    res.status(400).json({ error: error.message || "OTP verification failed" });
  }
};

// ─── Change password ─────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const firebaseUid = req.user.uid;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    await admin.auth().updateUser(firebaseUid, { password: newPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to change password" });
  }
};

// ─── Link GitHub ─────────────────────────────────────────────────────────────
export const linkGithub = async (req, res) => {
  try {
    const { githubId, githubUsername, githubAccessToken } = req.body;
    const firebaseUid = req.user.uid;

    await convex.mutation(anyApi.users.linkGithub, {
      firebaseUid,
      githubId: githubId ?? '',
      githubUsername: githubUsername ?? '',
      ...(githubAccessToken && { githubAccessToken }),
    });

    res.json({ message: "GitHub account linked" });
  } catch (error) {
    console.error("Link GitHub Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to link GitHub" });
  }
};
