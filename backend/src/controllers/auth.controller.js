const authService = require('../services/auth.service');
const prisma = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { token, user } = await authService.register(
      req.body.email,
      req.body.password,
      req.body.confirmPassword
    );
    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { token, user } = await authService.login(
      req.body.email,
      req.body.password
    );
    res.json({ token, user });
  } catch (err) {
    if (err.message === "Invalid credentials") {
      res.status(401).json({ message: err.message });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
};

exports.google = async (req, res) => {
  try {
    const { token, user } = await authService.googleAuth(req.body.idToken);
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ message: err.message || "Google auth failed" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, avatar: true, provider: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
