const bcrypt = require('bcryptjs');
const config = require('../config');
require('dotenv').config({ quiet: true });
const { ValidationError } = require('../utils/errorHandler');

const minLength = config.minPasswordLength;
const MAX_BYTES = 72;

const validatePassword = (password) => {
  if (typeof password !== 'string')
    throw new ValidationError('Password must be a string');

  if (password.length < minLength)
    throw new ValidationError(
      `Password must be at least ${minLength} characters long`,
    );

  if (Buffer.byteLength(password, 'utf8') > MAX_BYTES) {
    throw new ValidationError(
      `Password exceeds maximum byte length of ${MAX_BYTES}`,
    );
  }
};

const hashPassword = async (plainPassword) => {
  validatePassword(plainPassword);

  const saltRounds = config.bcryptRounds;
  return await bcrypt.hash(plainPassword, saltRounds);
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  if (typeof plainPassword !== 'string') return false;
  if (typeof hashedPassword !== 'string' || hashedPassword.length === 0)
    return false;
  if (Buffer.byteLength(plainPassword, 'utf8') > MAX_BYTES) return false;

  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { hashPassword, verifyPassword, validatePassword };
