const { validationResult } = require('express-validator');
const customerService = require('../services/customer.service');

exports.getAll = async (req, res, next) => {
  try {
    const result = await customerService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await customerService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const data = await customerService.create(req.body, req.files || {});
    res.status(201).json({ success: true, data, message: 'Customer created successfully' });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const data = await customerService.update(req.params.id, req.body, req.files || {});
    res.json({ success: true, data, message: 'Customer updated successfully' });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    await customerService.delete(req.params.id);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) { next(error); }
};

exports.getAccounts = async (req, res, next) => {
  try {
    const customer = await customerService.getById(req.params.id);
    res.json({ success: true, data: customer.accounts });
  } catch (error) { next(error); }
};

exports.getTimeline = async (req, res, next) => {
  try {
    const data = await customerService.getTimeline(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getSummary = async (req, res, next) => {
  try {
    const data = await customerService.getSummary(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
