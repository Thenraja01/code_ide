const authService = require('../layers/auth.service');
const prisma = require('../../database/prisma');

exports.register = async (req, res) => {
  try {
    const token = await authService.register(
      req.body.email,
      req.body.password,
      req.body.confirmPassword
    );
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const token = await authService.login(
      req.body.email,
      req.body.password
    );
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.google = async (req, res) => {
  try {
    const token = await authService.googleAuth(req.body.idToken);
    res.json({ token });
  } catch {
    res.status(401).json({ message: "Google auth failed" });
  }
};
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, provider: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
