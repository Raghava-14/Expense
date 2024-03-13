const express = require('express');
const userController = require('../controllers/userController'); // Adjust path as necessary
const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;
