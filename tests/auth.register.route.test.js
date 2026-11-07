jest.mock('../src/db/users', () => ({ createUser: jest.fn() }));
// The ONLY fake: no database connection is made. Everything else is the real code.

const request = require('supertest');
const app = require('../src/app');
const config = require('../src/config');
const { createUser } = require('../src/db/users');

const valid = {
  email: 'sam@example.com',
  displayName: 'Sam Lee',
  password: 'a-long-test-password-123',
};

const post = (body) => request(app).post('/auth/register').send(body);

let consoleError;
beforeEach(() => {
  jest.resetAllMocks();
  createUser.mockImplementation(async ({ email, displayName }) => ({
    id: 'u1',
    email,
    display_name: displayName,
  }));
  // Pretend the database saved the user and handed back the row.

  consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  // Keep the output clean, and let us check what gets logged.
});
afterEach(() => consoleError.mockRestore());

describe('POST /auth/register', () => {
  describe('success', () => {
    it('returns 201 and the public user, with no hash', async () => {
      const res = await post(valid);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        user: { id: 'u1', email: 'sam@example.com', displayName: 'Sam Lee' },
      });
      expect(JSON.stringify(res.body)).not.toMatch(/hash|\$2/i);
    });

    it('stores a bcrypt hash and never the plain password', async () => {
      await post(valid);

      const saved = createUser.mock.calls[0][0];
      expect(saved.passwordHash).toMatch(/^\$2[aby]\$/);
      expect(JSON.stringify(saved)).not.toContain(valid.password);
    });

    it('cleans the email before saving it', async () => {
      await post({ ...valid, email: '  SAM@Example.COM ' });
      expect(createUser.mock.calls[0][0].email).toBe('sam@example.com');
    });
  });

  describe('bad input returns 400 and never reaches the database', () => {
    it.each([
      ['an empty object', {}],
      ['an invalid email', { ...valid, email: 'nope' }],
      ['a one-letter display name', { ...valid, displayName: 'S' }],
      ['a non-string password', { ...valid, password: 12345 }],
    ])('%s', async (_name, body) => {
      const res = await post(body);
      expect(res.status).toBe(400);
      expect(createUser).not.toHaveBeenCalled();
      // %s in the title is replaced by the first array item, so each case is named.
    });

    it('reports which fields failed', async () => {
      const res = await post({});
      const fields = res.body.details.map((d) => d.field);
      expect(fields).toEqual(
        expect.arrayContaining(['email', 'displayName', 'password']),
      );
    });

    it('rejects a password shorter than the configured minimum', async () => {
      const res = await post({
        ...valid,
        password: 'a'.repeat(config.minPasswordLength - 1),
      });
      expect(res.status).toBe(400);
      expect(createUser).not.toHaveBeenCalled();
    });

    it('rejects a password over 72 bytes, counting bytes and not characters', async () => {
      expect((await post({ ...valid, password: 'a'.repeat(73) })).status).toBe(
        400,
      );
      expect((await post({ ...valid, password: 'é'.repeat(40) })).status).toBe(
        400,
      );
      // 40 "é" is 40 characters but 80 bytes.
    });

    it('rejects malformed JSON with 400, not 500', async () => {
      const res = await request(app)
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": "sam@example.com"');
      // A raw string with a missing closing brace.
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('errors from below', () => {
    it('returns 409 as JSON for a duplicate email', async () => {
      createUser.mockRejectedValue(
        Object.assign(new Error('dup'), { code: '23505' }),
      );

      const res = await post(valid);

      expect(res.status).toBe(409);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body).toEqual({
        error: 'An account with this email already exists',
      });
    });

    it('returns a generic 500 and leaks nothing for an unexpected error', async () => {
      createUser.mockRejectedValue(
        new Error('relation "users" does not exist'),
      );

      const res = await post(valid);

      expect(res.status).toBe(500);
      expect(JSON.stringify(res.body)).not.toContain('relation');
      expect(consoleError.mock.calls.flat().join(' ')).not.toContain(
        valid.email,
      );
    });
  });
});
