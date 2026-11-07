const authService = require('../services/authService');

const register = async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ user });
};

module.exports = { register };
