/**
 * Generic request body / query validation middleware using Joi.
 *
 * Usage:
 *   const { validate } = require('./validate.middleware');
 *   router.post('/upload', validate(mySchema), controller);
 *
 * @param {import('joi').Schema} schema - Joi schema to validate req.body against
 * @param {'body'|'query'|'params'} [target='body']
 */
function validate(schema, target = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], { abortEarly: false });

    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details.map((d) => d.message).join(', '),
      });
    }

    req[target] = value; // replace with Joi-coerced values
    next();
  };
}

module.exports = { validate };
