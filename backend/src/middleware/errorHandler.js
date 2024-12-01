const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handling specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    });
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({
      error: 'Conflict Error',
      message: 'Resource already exists'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ?
      'An unexpected error occurred' : err.message
  });
};

module.exports = errorHandler;