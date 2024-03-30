const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController'); 
const verifyToken = require('../middleware/authMiddleware');

// Route to create a new comment on an expense
router.post('/:expenseId/comments', verifyToken, commentController.createComment);

// Route to get comments for an expense
router.get('/:expenseId/comments', verifyToken, commentController.viewCommentsForExpense);

// Route to update a specific comment
router.put('/:expenseId/comments/:commentId', verifyToken, commentController.updateComment);

// Route to delete a specific comment
router.delete('/:expenseId/comments/:commentId', verifyToken, commentController.deleteComment);

module.exports = router;
