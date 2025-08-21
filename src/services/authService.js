const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const getUserFromToken = async (token) => {
  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id).select('-password');
  return user;
};

module.exports = { generateToken, verifyToken, getUserFromToken };