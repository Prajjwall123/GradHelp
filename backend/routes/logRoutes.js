const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    getLogs,
    getLog,
    deleteLog,
    deleteLogs
} = require('../controllers/logController');

// All routes are protected and admin-only
router.use(auth);
router.use((req, res, next) => authorize('admin')(req, res, next));

router
    .route('/')
    .get(getLogs)
    .delete(deleteLogs);

router
    .route('/:id')
    .get(getLog)
    .delete(deleteLog);

module.exports = router;
