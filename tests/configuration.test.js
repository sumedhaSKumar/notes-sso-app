const validators = require('../src/config/validators');
const getJwtSecret = validators.getJwtSecret;

describe(' Test JWT secretConfiguration', () => {
  it('should throw an error if JWT_SECRET is not provided', () => {
    expect(() => getJwtSecret()).toThrow('JWT_SECRET is not provided');
  });

  it('should throw an error if JWT_SECRET is less than 32 characters long', () => {
    expect(() => getJwtSecret('Abc')).toThrow(
      'JWT_SECRET must be at least 32 characters long',
    );
  });

  it('should pass if JWT_SECRET is provided and is at least 32 characters long', () => {
    expect(() => getJwtSecret('ab'.repeat(32))).not.toThrow();
  });
});
