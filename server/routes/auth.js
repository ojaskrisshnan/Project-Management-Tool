const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/users', require('../middleware/auth').verifyToken, authController.getUsers);

module.exports = router; 