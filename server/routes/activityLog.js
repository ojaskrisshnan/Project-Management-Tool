const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { verifyToken } = require('../middleware/auth');

router.get('/project/:projectId', verifyToken, activityLogController.getLogsByProject);
router.get('/task/:taskId', verifyToken, activityLogController.getLogsByTask);

module.exports = router; 