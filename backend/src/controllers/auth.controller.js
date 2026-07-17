const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid username or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'username', 'created_at'] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }

    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 12);
    await user.update({ password: hashed });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
