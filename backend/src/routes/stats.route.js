const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/stats.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, getStats);

module.exports = router;
