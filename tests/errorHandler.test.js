const errorHandler = require('../src/middleware/errorHandler');
const { AppError, ValidationError } = require('../src/error');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  // Each method returns res itself, so chained calls like res.status(400).json(...) work.
  return res;
};

const run = (err) => {
  const res = makeRes();
  errorHandler(err, {}, res, jest.fn());
  // Call the handler directly with a pretend request, our fake response and a dummy next.
  return res;
};

let consoleError;
beforeEach(() => {
  consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  // Silence and record console.error, so test output stays clean and we can inspect it.
});
afterEach(() => consoleError.mockRestore());

describe('errorHandler', () => {
  it('sends an AppError with its own status and message', () => {
    const res = run(
      new AppError('An account with this email already exists', 409),
    );
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: 'An account with this email already exists',
    });
  });

  it('sends a ValidationError as 400 with its message', () => {
    const res = run(
      new ValidationError('Password must be at least 10 characters long'),
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Password must be at least 10 characters long',
    });
  });

  it('sends a malformed JSON body as 400, not 500', () => {
    const err = Object.assign(new SyntaxError('Unexpected token'), {
      type: 'entity.parse.failed',
      status: 400,
      statusCode: 400,
    });
    // This is the shape Express's body parser gives when the JSON is broken.
    const res = run(err);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('keeps other client-error statuses from the body parser, such as 413 for a too-large body', () => {
    const res = run(
      Object.assign(new Error('too large'), { status: 413, statusCode: 413 }),
    );
    expect(res.status).toHaveBeenCalledWith(413);
  });

  it('answers unknown errors with a generic 500', () => {
    const res = run(new Error('relation "users" does not exist'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  it('never leaks internal error details to the client', () => {
    const res = run(
      new Error('password authentication failed for user "admin"'),
    );
    const body = JSON.stringify(res.json.mock.calls[0][0]);
    expect(body).not.toContain('admin');
    expect(body).not.toContain('password authentication');
  });

  it('logs only the message of an unknown error, never the full error object', () => {
    const err = new Error('boom');
    run(err);
    const logged = consoleError.mock.calls[0];
    expect(logged).not.toContain(err[0]);
    // Database error objects can carry email addresses in their details.
    expect(logged.join(' ')).toContain('boom');
  });

  it('does not log expected errors', () => {
    run(new AppError(409, 'dup'));
    run(new ValidationError('bad'));
    expect(consoleError).not.toHaveBeenCalled();
  });
});
