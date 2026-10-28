require('dotenv').config();
const { getJwtSecret } = require('./validators');
const bcryptRounds =
  process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
    ? 4
    : parseInt(process.env.COST_FACTOR, 10) || 12;
const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: getJwtSecret(process.env.JWT_SECRET),
  bcryptRounds,
  minPasswordLength: parseInt(process.env.MIN_PASSWORD_LENGTH, 10) || 8,
};

module.exports = config;
