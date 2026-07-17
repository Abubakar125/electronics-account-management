const router = require('express').Router();
const ctrl = require('../controllers/customer.controller');
const auth = require('../middlewares/auth.middleware');
const { customerCreateRules, customerUpdateRules } = require('../validators/customer.validator');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', customerCreateRules, ctrl.create);
router.put('/:id', customerUpdateRules, ctrl.update);
router.delete('/:id', ctrl.delete);
router.get('/:id/accounts', ctrl.getAccounts);
router.get('/:id/timeline', ctrl.getTimeline);
router.get('/:id/summary', ctrl.getSummary);

module.exports = router;
