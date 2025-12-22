// server/src/middleware/errorHandler.js
const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400; // Bad Request for Prisma known errors
    switch (err.code) {
      case 'P2002':
        message = 'Unique constraint failed. This record already exists.';
        break;
      case 'P2025':
        message = 'Record not found.';
        break;
      // Add more Prisma error codes as needed
      default:
        message = `Database error: ${err.message}`;
        break;
    }
  }

  res.status(statusCode).json({
    message: message,
    // In production, you might not want to send detailed error info
    // stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;

