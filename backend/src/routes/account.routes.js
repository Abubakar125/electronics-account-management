const router = require('express').Router();
const ctrl = require('../controllers/account.controller');
const auth = require('../middlewares/auth.middleware');
const { accountCreateRules, accountUpdateRules } = require('../validators/account.validator');

router.use(auth);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', accountCreateRules, ctrl.create);
router.put('/:id', accountUpdateRules, ctrl.update);
router.delete('/:id', ctrl.delete);
router.get('/:id/payments', ctrl.getPayments);

module.exports = router;
