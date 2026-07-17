const { validationResult } = require('express-validator');
const paymentService = require('../services/payment.service');

exports.getAll = async (req, res, next) => {
  try {
    const result = await paymentService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await paymentService.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const data = await paymentService.create(req.body);
    res.status(201).json({ success: true, data, message: 'Payment recorded successfully' });
  } catch (error) { next(error); }
};

exports.getReceipt = async (req, res, next) => {
  try {
    const pdfBuffer = await paymentService.generateReceiptPDF(req.params.id);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="receipt-${req.params.id}.pdf"` });
    res.send(pdfBuffer);
  } catch (error) { next(error); }
};
