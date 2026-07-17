const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const auth = require('../middlewares/auth.middleware');
const { paymentCreateRules } = require('../validators/payment.validator');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', paymentCreateRules, ctrl.create);
router.get('/:id/receipt', ctrl.getReceipt);

module.exports = router;
