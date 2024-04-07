const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const verifyToken = require('../middleware/authMiddleware');

//Get all categories
router.get('/', verifyToken, categoryController.getCategories);

module.exports = router;