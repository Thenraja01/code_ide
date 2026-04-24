import admin from '../firebase/firebase.config.js';

/**
 * Firebase Auth Middleware
 */
export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
    };
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
