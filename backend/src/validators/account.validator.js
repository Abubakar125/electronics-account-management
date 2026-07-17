const { body } = require('express-validator');

const accountCreateRules = [
  body('customer_id').notEmpty().withMessage('Customer is required').isInt(),
  body('product_name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 150 }),
  body('total_price').notEmpty().withMessage('Total price is required')
    .isFloat({ min: 0.01 }).withMessage('Total price must be greater than 0'),
  body('advance').optional().isFloat({ min: 0 }).withMessage('Advance must be 0 or greater'),
  body('monthly_installment').notEmpty().withMessage('Monthly installment is required')
    .isFloat({ min: 0.01 }).withMessage('Monthly installment must be greater than 0'),
  body('duration').notEmpty().withMessage('Duration is required')
    .isInt({ min: 1 }).withMessage('Duration must be at least 1 month'),
  body('purchase_date').notEmpty().withMessage('Purchase date is required').isDate(),
  body('due_date').optional().isDate(),
  body('brand').optional().trim().isLength({ max: 100 }),
  body('model').optional().trim().isLength({ max: 100 }),
];

const accountUpdateRules = [
  body('product_name').optional().trim().notEmpty().isLength({ max: 150 }),
  body('brand').optional().trim().isLength({ max: 100 }),
  body('model').optional().trim().isLength({ max: 100 }),
  body('due_date').optional().isDate(),
  body('status').optional().isIn(['active', 'completed', 'cancelled', 'overdue']),
];

module.exports = { accountCreateRules, accountUpdateRules };
