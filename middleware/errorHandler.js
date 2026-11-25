/**
 * Middleware penanganan route yang tidak ditemukan (404 Not Found).
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Endpoint tidak ditemukan - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Middleware terpusat untuk menangani seluruh error aplikasi & Mongoose.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Terjadi kesalahan pada server';

  // Mongoose CastError (format ObjectId tidak valid)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Format ID komik tidak valid';
  }

  // Mongoose ValidationError (input tidak memenuhi syarat Schema)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(', ');
  }

  // Mongoose Duplicate Key Error (misal mangadexId sudah pernah diimport)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Data dengan ${field} tersebut sudah ada di database`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
