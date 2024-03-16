const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); 
const verifyToken = require('../middleware/authMiddleware');

// Register 
router.post('/register', userController.register);

// Login
router.post('/login', userController.login);

// Get user info
router.get('/me', verifyToken, userController.getUserInfo);

// Update user info
router.put('/me', verifyToken, userController.updateUserInfo);

// Update email
router.put('/me/email', verifyToken, userController.updateUserEmail);

// Update password
router.put('/me/password', verifyToken, userController.updateUserPassword);

// Delete user account
router.delete('/me', verifyToken, userController.deleteUserAccount);

module.exports = router;
