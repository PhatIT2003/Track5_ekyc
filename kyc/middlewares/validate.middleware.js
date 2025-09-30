const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = {};
      error.details.forEach((err) => {
        const field = err.path[0];
        errors[field] = err.message;
      });


      return res.status(400).json({
        success: false,
        errors,
      });
    }

    req.body = value;
    next();
  };
};

module.exports = validate;
