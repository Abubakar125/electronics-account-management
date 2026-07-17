const { body } = require('express-validator');

const paymentCreateRules = [
  body('account_id').notEmpty().withMessage('Account is required').isInt(),
  body('amount').notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('payment_date').notEmpty().withMessage('Payment date is required').isDate(),
  body('remarks').optional().trim(),
];

module.exports = { paymentCreateRules };
