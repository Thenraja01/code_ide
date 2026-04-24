import { convex, anyApi } from '../config/convex.js';
import admin from '../firebase/firebase.config.js';

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const firebaseUid = req.user.uid;

    // Update in Firebase
    const updateData = {};
    if (name) updateData.displayName = name;
    if (email) updateData.email = email;

    if (Object.keys(updateData).length > 0) {
      await admin.auth().updateUser(firebaseUid, updateData);
    }

    // Sync updated info to Convex
    await convex.mutation(anyApi.users.syncUser, {
      firebaseUid,
      email: email || req.user.email,
      name: name || req.user.name,
    });

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ error: "OTP is required" });
    }

    // TODO: Implement OTP verification logic (e.g., via Firebase or external service)
    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const firebaseUid = req.user.uid;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    // Update password in Firebase Admin
    await admin.auth().updateUser(firebaseUid, { password: newPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to change password" });
  }
};
