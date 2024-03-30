const { Comment, Expense, SharedExpense, User} = require('../models');

// Check if user is involved in the expense
async function checkUserInvolvement(userId, expenseId) {
    // Check for personal expense
    const personalExpense = await Expense.findOne({
      where: { id: expenseId, created_by: userId },
      paranoid: false,
    });
  
    if (personalExpense) return true;
  
    // Check for shared or group expense
    const sharedExpense = await SharedExpense.findOne({
      where: { expense_id: expenseId, user_id: userId },
      include: [{
        model: Expense,
        as: 'Expense',
        paranoid: false,
      }],
    });
  
    return !!sharedExpense;
  }


// Create a new comment
exports.createComment = async (req, res, next) => {
  const userId = req.user.id; // Assuming you extract this from JWT token or session
  const { expenseId } = req.params; // Assuming expenseId is passed as URL parameter
  const { comment } = req.body; // Assuming the comment text is passed in request body

  try {
    // Check if user is involved in the expense
    const isUserInvolved = await checkUserInvolvement(userId, expenseId);
    if (!isUserInvolved) {
      return res.status(403).json({ message: "You are not authorized to comment on this expense." });
    }

    // Create the comment
    const newComment = await Comment.create({
      comment,
      expense_id: expenseId,
      user_id: userId
    });

    res.status(201).json({
      message: "Comment created successfully",
      data: newComment
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    next(error); // Pass the error to an error handling middleware
  }
};


//View comments for an expense
exports.viewCommentsForExpense = async (req, res, next) => {
    const userId = req.user.id;
    const { expenseId } = req.params;
  
    try {
      //Check if the current user is involved in the expense before showing comments
      const isUserInvolved = await checkUserInvolvement(userId, expenseId);
      if (!isUserInvolved) {
        return res.status(403).json({ message: "You are not authorized to view comments on this expense." });
      }
  
      // Fetch comments for the given expenseId
      const comments = await Comment.findAll({
        where: { expense_id: expenseId },
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'first_name'], // Adjust based on your User model attributes
          },
        ],
        order: [['createdAt', 'ASC']], // Optional: Order by creation time
      });
  
      res.status(200).json({
        message: "Comments retrieved successfully",
        data: comments
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      next(error);
    }
  };


//Update an existing comment
exports.updateComment = async (req, res, next) => {
    const userId = req.user.id;
    const { expenseId, commentId } = req.params;
    const { comment: updatedCommentText } = req.body;
  
    try {
      // First, check if the user is involved in the expense
      const isUserInvolved = await checkUserInvolvement(userId, expenseId);
      if (!isUserInvolved) {
        return res.status(403).json({ message: "You are not authorized to update comments on this expense." });
      }
  
      // Check if the comment exists and belongs to the user
      const comment = await Comment.findOne({
        where: { 
          id: commentId,
          user_id: userId, // Ensuring that only the creator can update the comment
          expense_id: expenseId // Ensuring the comment is associated with the correct expense
        }
      });
  
      if (!comment) {
        return res.status(404).json({ message: "Comment not found or you do not have permission to update it." });
      }
  
      // Update the comment
      await comment.update({ comment: updatedCommentText });
      res.status(200).json({
        message: "Comment updated successfully",
        data: comment
      });
  
    } catch (error) {
      console.error('Error updating comment:', error);
      next(error); // Pass the error to an error handling middleware
    }
  };


  // Delete a comment
exports.deleteComment = async (req, res, next) => {
    const userId = req.user.id; // Assuming you extract this from JWT token or session
    const { expenseId, commentId } = req.params; // Assuming expenseId and commentId are passed as URL parameters
  
    try {
      // First, check if the user is involved in the expense or is the comment creator
      const isUserInvolvedOrCreator = await checkUserInvolvement(userId, expenseId, commentId);
      if (!isUserInvolvedOrCreator) {
        return res.status(403).json({ message: "You are not authorized to delete this comment." });
      }
  
      // Delete the comment
      await Comment.destroy({
        where: { id: commentId }
      });
  
      res.status(200).json({
        message: "Comment deleted successfully"
      });
  
    } catch (error) {
      console.error('Error deleting comment:', error);
      next(error); // Pass the error to an error handling middleware
    }
  };
  
  