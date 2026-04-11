const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const generateToken = require('../utils/generateToken');
const admin = require('../firebase/firebase.config');

exports.register = async (email, password, confirmPassword) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { 
      email, 
      password: hashed, 
      provider: 'local',
      name: email.split('@')[0]
    }
  });

  const token = generateToken(user);
  return { token, user: { id: user.id, email: user.email, name: user.name } };
};

exports.login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("Invalid credentials");
  if (user.provider !== 'local') throw new Error(`Please login with ${user.provider}`);

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken(user);
  return { token, user: { id: user.id, email: user.email, name: user.name } };
};

exports.googleAuth = async (idToken) => {
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);

    let user = await prisma.user.findUnique({
      where: { email: decoded.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: decoded.email,
          name: decoded.name || decoded.email.split('@')[0],
          avatar: decoded.picture,
          provider: 'google',
          isEmailVerified: true
        }
      });
    }

    const token = generateToken(user);
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  } catch (err) {
    console.error("Firebase Auth Error:", err.message);
    throw new Error("Google authentication failed");
  }
};
