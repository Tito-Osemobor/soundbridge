const errorHandler = (error, req, res, next) => {
  console.error(`❌  Error: ${error.message}`);

  res.status(error.statusCode || 500).json({
    success: false,
    errorType: error.constructor.name, // ✅  Include error type
    message: error.message || "Internal Server Error",
  });
};

module.exports = {errorHandler};
