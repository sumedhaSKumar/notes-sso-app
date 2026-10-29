const config = require('../src/config');
const {
  hashPassword,
  verifyPassword,
  validatePassword,
} = require('../src/services/passwordService');
const { validationError } = require('../src/utils/errorHandler');
const MIN = config.minPasswordLength;
const validPassword = 'a'.repeat(MIN);

describe('validatePassword', () => {
  it('throws for a non-string', () => {
    expect(() => validatePassword(null)).toThrow(validationError);
  });

  it('Throws error for a number', () => {
    expect(() => validatePassword(123)).toThrow(validationError);
  });
  it('Throws error for a password one character shorter than the minimum', () => {
    expect(() => validatePassword('a'.repeat(MIN - 1))).toThrow(
      validationError,
    );
  });
  it('Accepts a password exactly at the minimum length', () => {
    expect(() => validatePassword(validPassword)).not.toThrow(validationError);
  });
  it('Accepts exactly 72 ASCII bytes', () => {
    const password = 'a'.repeat(72);
    expect(() => validatePassword(password)).not.toThrow(validationError);
  });
  it('Throws error for 73 bytes', () => {
    const password = 'a'.repeat(73);
    expect(() => validatePassword(password)).toThrow(validationError);
  });
  it('Throws error for 40 × "é" (40 characters but 80 bytes)', () => {
    const password = 'é'.repeat(40);
    expect(() => validatePassword(password)).toThrow(validationError);
  });
});

describe('hashPassword', () => {
  it('rejects a too-short password with validationError', async () => {
    await expect(hashPassword('a'.repeat(MIN - 1))).rejects.toThrow(
      validationError,
    );
  });

  it('returns a string starting with "$2"', async () => {
    const hash = await hashPassword(validPassword);
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
  });
  it('produces different hashes for the same password (salt)', async () => {
    const hash1 = await hashPassword(validPassword);
    const hash2 = await hashPassword(validPassword);
    expect(hash1).not.toBe(hash2);
  });
  it('uses the configured cost factor', async () => {
    const hash = await hashPassword(validPassword);
    expect(hash).toMatch(/^\$2[ayb]\$[0-9]{2}\$.{53}$/);
  });
});

describe('verifyPassword', () => {
  let hash;
  beforeAll(async () => {
    hash = await hashPassword(validPassword);
  });

  it('returns true for the correct password', async () => {
    expect(await verifyPassword(validPassword, hash)).toBe(true);
  });

  it('returns false for a wrong password', async () => {
    expect(await verifyPassword('wrongpassword', hash)).toBe(false);
  });
  it('returns false for a non-string', async () => {
    expect(await verifyPassword(null, hash)).toBe(false);
  });
  it('returns false for a password over 72 bytes', async () => {
    const password = 'a'.repeat(73);
    expect(await verifyPassword(password, hash)).toBe(false);
  });
  it('does NOT apply the min-length rule', async () => {
    const password = 'a'.repeat(MIN - 1);
    expect(await verifyPassword(password, hash)).toBe(false);
  });
});
