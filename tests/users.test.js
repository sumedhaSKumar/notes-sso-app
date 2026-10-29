jest.mock('../src/db', () => ({ query: jest.fn() }));
// Replace the real database module with a fake whose "query" is a spy function.

const db = require('../src/db');
const users = require('../src/db/users');

beforeEach(() => {
  db.query.mockReset();
});

describe('createUser', () => {
  const input = {
    email: 'a@example.com',
    displayName: 'A',
    passwordHash: 'hash1234567',
  };

  it('inserts with placeholders and returns the new user', async () => {
    const row = { id: 'u1', email: 'a@example.com', display_name: 'A' };
    db.query.mockResolvedValue({ rows: [row] });

    const result = await users.createUser(input);

    expect(result).toEqual(row);
  });

  it('stores NULL when there is no password hash (SSO-only user)', async () => {
    db.query.mockResolvedValue({ rows: [{}] });
    await users.createUser({ email: 'a@example.com', displayName: 'A' });
    expect(db.query.mock.calls[0][1][2]).toBeNull();
  });

  it('does not ask the database to return the password hash', async () => {
    db.query.mockResolvedValue({ rows: [{}] });
    await users.createUser(input);
    expect(db.query.mock.calls[0][0]).not.toMatch(
      /RETURNING[^;]*password_hash/i,
    );
  });

  it('lets database errors through unchanged', async () => {
    const dbError = Object.assign(new Error('duplicate'), { code: '23505' });
    db.query.mockRejectedValue(dbError);
    await expect(users.createUser(input)).rejects.toBe(dbError);
    // toBe checks it's the very same object, so the 23505 code survives for the service layer.
  });
});

describe('findByEmail', () => {
  it('returns the user including the password hash', async () => {
    const row = {
      id: 'u1',
      email: 'a@example.com',
      display_name: 'A',
      password_hash: 'hash1234567',
    };
    db.query.mockResolvedValue({ rows: [row] });
    expect(await users.findByEmail('a@example.com')).toEqual(row);
  });

  it('returns null when nobody matches', async () => {
    db.query.mockResolvedValue({ rows: [] });
    expect(await users.findByEmail('nobody@example.com')).toBeNull();
  });

  it('matches case-insensitively in SQL and passes the email through as-is', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await users.findByEmail('MiXed@Example.com');
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toMatch(/lower\(email\)\s*=\s*lower\(\$1\)/i);
    expect(params).toEqual(['MiXed@Example.com']);
  });

  it('names its columns instead of using SELECT *', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await users.findByEmail('a@example.com');
    const sql = db.query.mock.calls[0][0];
    expect(sql).not.toMatch(/select\s+\*/i);
    expect(sql).toMatch(/password_hash/i);
    // This is the one query allowed to read the hash, because login needs it.
  });
});

describe('findById', () => {
  it('returns the user', async () => {
    const row = { id: 'u1', email: 'a@example.com', display_name: 'A' };
    db.query.mockResolvedValue({ rows: [row] });
    expect(await users.findById('u1')).toEqual(row);
    expect(db.query.mock.calls[0][1]).toEqual(['u1']);
  });

  it('returns null when the id does not exist', async () => {
    db.query.mockResolvedValue({ rows: [] });
    expect(await users.findById('u1')).toBeNull();
  });

  it('never selects the password hash', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await users.findById('u1');
    const sql = db.query.mock.calls[0][0];
    expect(sql).not.toMatch(/password_hash/i);
    expect(sql).not.toMatch(/select\s+\*/i);
  });
});
