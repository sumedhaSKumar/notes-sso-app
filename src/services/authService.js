const { validatePassword, hashPassword } = require('./passwordService');
const { createUser } = require('../db/users');
const { AppError } = require('../error');

const register = async ({ email, displayName, password }) => {
  // Validate the password before hashing it
  if (password) {
    validatePassword(password);
  }
  const passwordHash = await hashPassword(password);

  try {
    const user = await createUser({
      email,
      displayName,
      passwordHash,
    });
    return { id: user.id, email: user.email, displayName: user.display_name };
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('An account with this email already exists', 409);
    } else {
      throw error;
    }
  }
};

module.exports = { register };
