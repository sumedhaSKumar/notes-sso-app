const db = require('./index');

const createUser = async ({ email, displayName, passwordHash }) => {
  //sql query to insert new user in table users
  const query = `
    INSERT INTO users (email, display_name, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, email, display_name;
  `;

  const values = [email, displayName, passwordHash ?? null];

  const result = await db.query(query, values);
  return result.rows[0];
};

const findByEmail = async (email) => {
  const query =
    'SELECT id, email, display_name, password_hash FROM users WHERE lower(email) = lower($1)';
  const result = await db.query(query, [email]);
  return result.rows[0] || null;
};

const findById = async (id) => {
  const query = 'SELECT id, email, display_name FROM users WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

module.exports = { createUser, findByEmail, findById };
