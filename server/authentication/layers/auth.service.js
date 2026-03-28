const prisma = require('../../database/prisma');
const { hashPassword, comparePassword } = require('../../src/utils/hash');
const generateToken = require('../../src/utils/generateToken');
const admin = require('../../src/firebase/firebase.config');

exports.register = async (email, password) => {
  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, password: hashed, provider: 'local' }
  });

  return generateToken(user);
};

exports.login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("User not found");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Invalid password");

  return generateToken(user);
};

exports.googleAuth = async (idToken) => {
  const decoded = await admin.auth().verifyIdToken(idToken);

  let user = await prisma.user.findUnique({
    where: { email: decoded.email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: decoded.email,
        provider: 'google'
      }
    });
  }

  return generateToken(user);
};
