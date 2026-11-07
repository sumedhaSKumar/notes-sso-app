const { AppError, ValidationError } = require('../error');

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by their four parameters
const errorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.message === 'too large') {
    return res.status(413).json({ error: 'Request entity too large' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  res.status(500).json({ error: 'Internal Server Error' });

  console.error('Unexpected error:', err.message);

  res.status(500).json({ error: 'Something went wrong' });
};

module.exports = errorHandler;
