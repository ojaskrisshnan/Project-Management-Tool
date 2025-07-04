const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, requireRole(['Admin', 'Manager']), projectController.createProject);
router.get('/', verifyToken, projectController.getProjects);
router.get('/:id', verifyToken, projectController.getProject);
router.put('/:id', verifyToken, requireRole(['Admin', 'Manager']), projectController.updateProject);
router.delete('/:id', verifyToken, requireRole(['Admin', 'Manager']), projectController.deleteProject);

module.exports = router; 