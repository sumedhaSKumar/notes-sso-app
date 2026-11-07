const { registerSchema } = require('../src/schemas/authSchemas');

const valid = {
  email: 'sam@example.com',
  displayName: 'Sam Lee',
  password: 'a-long-test-password',
};

const check = (overrides) =>
  registerSchema.safeParse({ ...valid, ...overrides });

describe('registerSchema', () => {
  it('accepts valid input', () => {
    expect(check({}).success).toBe(true);
  });

  it('trims and lowercases the email', () => {
    const result = check({ email: '  Sam@Example.COM ' });
    expect(result.data.email).toBe('sam@example.com');
  });

  it('trims the display name but keeps its capitals', () => {
    expect(check({ displayName: '  Sam Lee ' }).data.displayName).toBe(
      'Sam Lee',
    );
  });

  it('rejects an invalid email', () => {
    expect(check({ email: 'nope' }).success).toBe(false);
  });

  it('rejects an email longer than 254 characters', () => {
    expect(check({ email: `${'a'.repeat(250)}@example.com` }).success).toBe(
      false,
    );
  });

  it('enforces the display name length boundaries (2 to 100)', () => {
    expect(check({ displayName: 'S' }).success).toBe(false);
    expect(check({ displayName: 'Sa' }).success).toBe(true);
    expect(check({ displayName: 'a'.repeat(100) }).success).toBe(true);
    expect(check({ displayName: 'a'.repeat(101) }).success).toBe(false);
    // Testing both sides of each boundary catches off-by-one mistakes.
  });

  it('rejects a display name that is only spaces', () => {
    expect(check({ displayName: '     ' }).success).toBe(false);
    // trim() runs first, leaving an empty string, which fails the minimum.
  });

  it('only checks that the password is a string (the real rules live in passwordService)', () => {
    expect(check({ password: 5 }).success).toBe(false);
    expect(check({ password: 'x' }).success).toBe(true);
    // A one-character password passes here ON PURPOSE. This test documents that the schema does not duplicate the password rules.
  });

  it('rejects missing fields and reports which ones', () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
    const fields = result.error.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(
      expect.arrayContaining(['email', 'displayName', 'password']),
    );
  });

  it('rejects a missing body', () => {
    expect(registerSchema.safeParse(undefined).success).toBe(false);
  });

  it('strips unknown fields so clients cannot set extra data', () => {
    const result = check({ role: 'admin', id: 'forced-id' });
    expect(result.data).not.toHaveProperty('role');
    expect(result.data).not.toHaveProperty('id');
    // Zod objects drop fields they don't know about. This guards against "mass assignment".
  });
});
