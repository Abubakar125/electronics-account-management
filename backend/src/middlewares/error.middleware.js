module.exports = (err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({ field: e.path, message: e.message })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
      field,
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Related record not found or cannot delete a record with dependencies.',
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
