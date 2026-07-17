const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const auth = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/dashboard', ctrl.getDashboard);
router.get('/collection', ctrl.getCollection);
router.get('/collection/export', ctrl.exportCollectionExcel);
router.get('/outstanding', ctrl.getOutstanding);
router.get('/outstanding/export', ctrl.exportOutstandingExcel);
router.get('/completed', ctrl.getCompleted);
router.get('/customers', ctrl.getCustomers);

module.exports = router;
