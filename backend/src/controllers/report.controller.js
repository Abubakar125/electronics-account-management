const reportService = require('../services/report.service');

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await reportService.getDashboardStats();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getCollection = async (req, res, next) => {
  try {
    const data = await reportService.getCollection(req.query);
    res.json({ success: true, ...data });
  } catch (error) { next(error); }
};

exports.getOutstanding = async (req, res, next) => {
  try {
    const data = await reportService.getOutstanding();
    res.json({ success: true, ...data });
  } catch (error) { next(error); }
};

exports.getCompleted = async (req, res, next) => {
  try {
    const data = await reportService.getCompleted(req.query);
    res.json({ success: true, ...data });
  } catch (error) { next(error); }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const data = await reportService.getCustomerReport();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.exportCollectionExcel = async (req, res, next) => {
  try {
    const buffer = await reportService.exportCollectionExcel(req.query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="collection-report.xlsx"',
    });
    res.send(buffer);
  } catch (error) { next(error); }
};

exports.exportOutstandingExcel = async (req, res, next) => {
  try {
    const buffer = await reportService.exportOutstandingExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="outstanding-report.xlsx"',
    });
    res.send(buffer);
  } catch (error) { next(error); }
};
