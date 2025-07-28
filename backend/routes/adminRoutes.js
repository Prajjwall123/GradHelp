const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/adminController');

router.use(auth);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);

module.exports = router;