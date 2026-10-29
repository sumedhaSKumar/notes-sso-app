const getJwtSecret = (secret) => {
  if (!secret) {
    throw new Error('JWT_SECRET is not provided');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return secret;
};

module.exports = { getJwtSecret };
