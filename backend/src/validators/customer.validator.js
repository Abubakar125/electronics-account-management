const { body } = require('express-validator');

const customerCreateRules = [
  body('name').trim().notEmpty().withMessage('Customer name is required').isLength({ max: 150 }),
  body('cnic').trim().notEmpty().withMessage('CNIC is required')
    .matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('CNIC must be in format: 35201-1234567-1'),
  body('phone1').trim().notEmpty().withMessage('Mobile number is required')
    .isLength({ min: 10, max: 20 }).withMessage('Enter a valid phone number'),
  body('father_name').optional().trim().isLength({ max: 150 }),
  body('phone2').optional().trim().isLength({ max: 20 }),
  body('address').optional().trim(),
  body('occupation').optional().trim().isLength({ max: 100 }),
  body('ref_name').optional().trim().isLength({ max: 150 }),
  body('ref_phone').optional().trim().isLength({ max: 20 }),
  body('ref_cnic').optional({ values: 'falsy' }).trim()
    .matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('Reference CNIC must be in format: 35201-1234567-1'),
  body('ref_address').optional().trim(),
];

const customerUpdateRules = [
  body('name').optional().trim().notEmpty().isLength({ max: 150 }),
  body('cnic').optional().trim()
    .matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('CNIC must be in format: 35201-1234567-1'),
  body('phone1').optional().trim().isLength({ min: 10, max: 20 }),
  body('father_name').optional().trim().isLength({ max: 150 }),
  body('phone2').optional().trim().isLength({ max: 20 }),
  body('address').optional().trim(),
  body('occupation').optional().trim().isLength({ max: 100 }),
  body('ref_name').optional().trim().isLength({ max: 150 }),
  body('ref_phone').optional().trim().isLength({ max: 20 }),
  body('ref_cnic').optional({ values: 'falsy' }).trim()
    .matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('Reference CNIC must be in format: 35201-1234567-1'),
  body('ref_address').optional().trim(),
];

module.exports = { customerCreateRules, customerUpdateRules };
