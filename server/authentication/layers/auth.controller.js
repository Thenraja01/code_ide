const authService = require('../layers/auth.service');

exports.register = async (req, res) => {
  try {
    const token = await authService.register(
      req.body.email,
      req.body.password
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
