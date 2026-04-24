import admin from '../firebase/firebase.config.js';
import { convex, anyApi } from '../config/convex.js';

/**
 * Helper: Sync a Firebase user into Convex users table.
 */
const syncUserToConvex = async (firebaseUser) => {
  try {
    const convexUserId = await convex.mutation(anyApi.users.syncUser, {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.name || null,
        avatar: firebaseUser.photoURL || firebaseUser.picture || null,
    });
    return convexUserId;
  } catch (err) {
    console.error("Convex Sync Failed:", err.message);
    return null;
  }
};

// GET /auth/me - Standard endpoint to verify idToken and get profile
export const getMe = async (req, res) => {
  try {
    const user = req.user; // Set by authMiddleware
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    const userRecord = await admin.auth().getUser(user.uid);
    const convexUser = await convex.query(anyApi.users.getUserByUid, { 
      firebaseUid: user.uid 
    });

    res.json({
      id: convexUser?._id || userRecord.uid,
      name: userRecord.displayName || convexUser?.name || null,
      email: userRecord.email,
      avatar: userRecord.photoURL || convexUser?.avatar || null,
      firebaseUid: userRecord.uid
    });
  } catch (error) {
    console.error("Get Me Error:", error.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Simplified handlers for other routes as they are mostly handled client-side
export const register = async (req, res) => {
    // Client SDK handles creation. This can be used for extra metadata setup.
    res.status(200).json({ message: "Register via Client SDK recommended" });
};

export const login = async (req, res) => {
    res.status(200).json({ message: "Login via Client SDK recommended" });
};

export const googleAuth = async (req, res) => {
    const { idToken } = req.body;
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        await syncUserToConvex(decodedToken);
        res.json({ status: "success", uid: decodedToken.uid });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

export const githubAuth = async (req, res) => {
    const { idToken } = req.body;
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        await syncUserToConvex(decodedToken);
        res.json({ status: "success", uid: decodedToken.uid });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const listResult = await admin.auth().listUsers(100);
        res.json(listResult.users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { login, register, googleAuth, githubAuth, getMe, getUsers };
