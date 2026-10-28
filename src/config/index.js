require('dotenv').config();
const { getJwtSecret } = require('./validators');

const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: getJwtSecret(process.env.JWT_SECRET),
};

module.exports = config;
