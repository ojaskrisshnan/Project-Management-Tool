const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, requireRole(['Admin', 'Manager']), taskController.createTask);
router.get('/', verifyToken, taskController.getTasks);
router.get('/:id', verifyToken, taskController.getTask);
router.put('/:id', verifyToken, requireRole(['Admin', 'Manager']), taskController.updateTask);
router.delete('/:id', verifyToken, requireRole(['Admin', 'Manager']), taskController.deleteTask);

module.exports = router; 