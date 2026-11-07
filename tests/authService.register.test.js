jest.mock('../src/db/users', () => ({ createUser: jest.fn() }));
// Fake database layer: no connection is opened.

jest.mock('../src/services/passwordService', () => ({
  validatePassword: jest.fn(),
  hashPassword: jest.fn(),
}));
// Fake BOTH functions your service imports from passwordService.

const { createUser } = require('../src/db/users');
const {
  validatePassword,
  hashPassword,
} = require('../src/services/passwordService');
const { register } = require('../src/services/authService');
const { AppError, ValidationError } = require('../src/error');
// Use the same errors file your service imports.

const input = {
  email: 'sam@example.com',
  displayName: 'Sam Lee',
  password: 'a-long-test-password',
};

const FAKE_HASH = '$2a$04$fakehashfakehashfakehashfakehash';

beforeEach(() => {
  jest.resetAllMocks();
  // Wipe every spy's history and behaviour so tests can't affect each other.

  validatePassword.mockReturnValue(undefined);
  hashPassword.mockResolvedValue(FAKE_HASH);
  createUser.mockResolvedValue({
    id: 'u1',
    email: 'sam@example.com',
    display_name: 'Sam Lee',
  });
  // Default "everything works" behaviour. Individual tests override it.
});

describe('register', () => {
  describe('success', () => {
    it('validates the password, then hashes it', async () => {
      await register(input);

      expect(validatePassword).toHaveBeenCalledWith(input.password);
      expect(hashPassword).toHaveBeenCalledWith(input.password);
      expect(validatePassword.mock.invocationCallOrder[0]).toBeLessThan(
        hashPassword.mock.invocationCallOrder[0],
      );
      // invocationCallOrder numbers every mock call globally, so a smaller number ran first.
    });

    it('stores the hash and never the plain password', async () => {
      await register(input);

      const saved = createUser.mock.calls[0][0];
      // First argument of the first createUser call.
      expect(saved.passwordHash).toBe(FAKE_HASH);
      expect(JSON.stringify(saved)).not.toContain(input.password);
    });

    it('passes the email and display name through unchanged', async () => {
      await register(input);
      expect(createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: input.email,
          displayName: input.displayName,
        }),
      );
    });

    it('returns a public user in camelCase with no hash', async () => {
      const result = await register(input);

      expect(result).toEqual({
        id: 'u1',
        email: 'sam@example.com',
        displayName: 'Sam Lee',
      });
      // toEqual is exact, so display_name or password_hash would make this fail.
    });
  });

  describe('failures', () => {
    it('turns a duplicate email (Postgres 23505) into a 409 AppError', async () => {
      createUser.mockRejectedValue(
        Object.assign(new Error('duplicate key'), { code: '23505' }),
      );

      await expect(register(input)).rejects.toBeInstanceOf(AppError);
      await expect(register(input)).rejects.toMatchObject({
        message: 'An account with this email already exists',
        statusCode: 409,
      });
    });

    it('rethrows other database errors unchanged', async () => {
      const dbError = Object.assign(new Error('connection lost'), {
        code: '08006',
      });
      createUser.mockRejectedValue(dbError);

      await expect(register(input)).rejects.toBe(dbError);
      // toBe means the very same object: nothing was swallowed or disguised.
    });

    it('does not hash or create a user when the password is rejected', async () => {
      validatePassword.mockImplementation(() => {
        throw new ValidationError('Password too short');
      });

      await expect(register(input)).rejects.toBeInstanceOf(ValidationError);
      expect(hashPassword).not.toHaveBeenCalled();
      expect(createUser).not.toHaveBeenCalled();
    });

    it('does not create a user when hashing fails', async () => {
      hashPassword.mockRejectedValue(new Error('bcrypt failed'));

      await expect(register(input)).rejects.toThrow('bcrypt failed');
      expect(createUser).not.toHaveBeenCalled();
    });

    it('does not turn a hashing error into a 409', async () => {
      const err = Object.assign(new Error('weird'), { code: '23505' });
      hashPassword.mockRejectedValue(err);
      // A 23505 code from the HASHING step is not a duplicate email.
      await expect(register(input)).rejects.not.toBeInstanceOf(AppError);
    });
  });
});
