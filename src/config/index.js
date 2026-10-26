require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
};

module.exports = config;
