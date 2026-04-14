const express = require('express');
const router = express.Router();
const { getStats, getRecentActivity } = require('../controllers/stats.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, getStats);
router.get('/activity', authMiddleware, getRecentActivity);

module.exports = router;
