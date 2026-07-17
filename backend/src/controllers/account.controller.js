const { validationResult } = require('express-validator');
const accountService = require('../services/account.service');

exports.getAll = async (req, res, next) => {
  try {
    const result = await accountService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await accountService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const data = await accountService.create(req.body);
    res.status(201).json({ success: true, data, message: 'Account created successfully' });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const data = await accountService.update(req.params.id, req.body);
    res.json({ success: true, data, message: 'Account updated successfully' });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    await accountService.delete(req.params.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) { next(error); }
};

exports.getPayments = async (req, res, next) => {
  try {
    const data = await accountService.getPayments(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
