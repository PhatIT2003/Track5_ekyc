const handleError = (err, req, res, next) => {
   // Nếu là lỗi validate của Mongoose
   if (err.name === 'ValidationError') {
      const errors = {};

      // Duyệt qua từng lỗi của từng field
      Object.keys(err.errors).forEach((key) => {
         errors[key] = err.errors[key].message;
      });

      return res.status(400).json({
         success: false,
         message: 'Validation failed',
         errors
      });
   }
   const status = err.status || 500;
   const message = err.message || 'Internal Server Error';

   return res.status(status).json({
      success: false,
      message
   });
};

module.exports = handleError;
