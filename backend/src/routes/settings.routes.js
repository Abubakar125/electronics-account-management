const router = require('express').Router();
const ctrl = require('../controllers/settings.controller');
const auth = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/', ctrl.get);
router.put('/', ctrl.update);

module.exports = router;
