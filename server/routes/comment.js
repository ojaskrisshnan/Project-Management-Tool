const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, commentController.addComment);
router.get('/:taskId', verifyToken, commentController.getComments);

module.exports = router; 