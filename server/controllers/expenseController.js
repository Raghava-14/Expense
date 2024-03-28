// controllers/expenseController.js 

const { Expense, SharedExpense, GroupMember, User, sequelize } = require('../models'); 
const calculateSharedExpenses = require('../helpers/calculateSharedExpenses');
const calculateNetBalanceForUser = require('../helpers/calculateNetBalanceForUser');
const calculateBalanceAndListExpensesBetweenUsers = require('../helpers/calculateBalanceAndListExpensesBetweenUsers');

//Create an expense
exports.createExpense = async (req, res, next) => {
    const userId  = req.user.id; // Extracting user ID from JWT token, adjust as needed
    const {
      name,
      amount,
      currency_code,
      category_id,
      expense_type,
      receipt,
      date = new Date(),
      sharedDetails,
      group_id,
    } = req.body; 

    // Validation: Expense amount should be greater than 0
    if (amount <= 0) {
      return res.status(400).send({ message: "Expense amount must be greater than 0." });
    }

    // Validation: Check group_id presence based on expense_type
    if (expense_type === 'shared' && group_id) {
      return res.status(400).send({ message: "Group ID should not be provided for shared expenses." });
    } else if (expense_type === 'group' && !group_id) {
      return res.status(400).send({ message: "Group ID must be provided for group expenses." });
    }
  
    try {
      const result = await sequelize.transaction(async (t) => {

        // Validation: Check if all user IDs exist (for shared and group expenses)
        if (expense_type === 'shared' || expense_type === 'group') {
          const userIds = sharedDetails.users.map(user => user.id);
          const existingUsers = await User.findAll({
              where: {
                  id: userIds
              }
          });

          // Collect IDs of users that exist in the database
          const existingUserIds = existingUsers.map(user => user.id);

          // Find any user IDs provided that do not exist in the database
          const invalidUserIds = userIds.filter(id => !existingUserIds.includes(id));

          if (invalidUserIds.length > 0) {
              return res.status(400).send({ message: `Invalid User ID(s): ${invalidUserIds.join(', ')}.` });
          }
        }

        // Validation: Ensure all users are part of the group for group expenses
        if (expense_type === 'group') {
          const groupMembers = await GroupMember.findAll({
            where: {
              group_id: group_id,
            },
            attributes: ['user_id'],
            raw: true,
          });

          const groupUserIds = groupMembers.map(member => member.user_id);
          const invalidUsers = sharedDetails.users.filter(user => !groupUserIds.includes(user.id));

          if (invalidUsers.length > 0) {
            throw new Error(`Users with IDs ${invalidUsers.map(user => user.id).join(", ")} are not part of the group.`);
          }
        }
        
        // Create the expense
        const expense = await Expense.create({
          name,
          amount,
          date,
          currency_code,
          category_id,
          expense_type,
          receipt,
          created_by: userId,
          updated_by: userId,
        }, { transaction: t });
  
        // If it's a shared or group expense
        if (expense_type === 'shared' || expense_type === 'group') {
          const userIds = sharedDetails.users.map(user => user.id);
          const uniqueUserIds = [...new Set(userIds)];
          if (userIds.length !== uniqueUserIds.length) {
            return res.status(400).send({ message: "User IDs must be unique." });
          }
            if (!sharedDetails || !sharedDetails.users) {
                throw new Error('Shared details or users are undefined');
              }
              
              const sharedExpensesData = calculateSharedExpenses({
                amount,
                splitType: sharedDetails.splitType,
                users: sharedDetails.users,
                groupId: group_id,
                expenseId: expense.id,
            });
            
          // Create shared expenses entries
          await SharedExpense.bulkCreate(sharedExpensesData, { transaction: t });
        }


  
        return expense;
      });
  
      res.status(201).json({
        message: "Expense created successfully",
        data: result
      });
    } catch (error) {
      next(error); // Pass any caught error to the centralized error handling middleware
    }
  };


//Calculate Balances
exports.getUserBalance = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming you're extracting this from the auth token or request parameters
    const balance = await calculateNetBalanceForUser(userId);
    res.json({
      message: "Net balance calculated successfully.",
      data: balance
    });
  } catch (error) {
    console.error("Error calculating user balance:", error);
    next(error); // Pass to error handling middleware
  }
};


//Balance between two users
exports.viewBalanceWithUser = async (req, res, next) => {
  const currentUserId = req.user.id;
  const { peerUserId } = req.params; // Assuming you're getting this from the URL
  // Validation to ensure current user is not equal to peer user
  if (currentUserId === peerUserId) {
    throw new Error("Current user cannot be the same as peer user.");
  }

  try {
    const result = await calculateBalanceAndListExpensesBetweenUsers(currentUserId, peerUserId);
    res.json({
      message: `Balance and shared expenses with user ${peerUserId}`,
      data: result
    });
  } catch (error) {
    console.error("Error viewing balance with user:", error);
    next(error); // Error handling
  }
};

//View All Expenses
exports.getExpenses = async (req, res, next) => {
  const userId = req.user.id; // Assuming user ID is extracted from JWT token or session

  try {
    // Fetch personal expenses
    const personalExpenses = await Expense.findAll({
      where: { created_by: userId },
      attributes: ['id', 'name', 'amount', 'date', 'split_type', 'category_id', 'expense_type']
    });

    // Fetch shared and group expenses
    const sharedExpenses = await SharedExpense.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Expense,
          as: 'Expense',
          attributes: ['id', 'name', 'amount', 'date', 'split_type', 'category_id', 'expense_type']
        }
      ]
    });

    // Prepare the response
    const response = {
      personalExpenses: personalExpenses.map(pe => ({
        type: 'personal',
        id: pe.id,
        name: pe.name,
        amount: pe.amount,
        date: pe.date,
        splitType: pe.split_type,
        categoryId: pe.category_id,
        expenseType: pe.expense_type
      })),
      sharedAndGroupExpenses: sharedExpenses.map(se => ({
        type: se.Expense.expense_type, // 'shared' or 'group'
        id: se.Expense.id,
        name: se.Expense.name,
        amount: se.Expense.amount,
        date: se.Expense.date,
        splitType: se.Expense.split_type,
        categoryId: se.Expense.category_id,
        expenseType: se.Expense.expense_type,
        yourContribution: se.paid_amount,
        yourShare: se.owed_amount
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error viewing expenses:', error);
    next(error); // Forward to error handling middleware
  }
};


//Soft delete an expense
exports.deleteExpense = async (req, res, next) => {
  const userId = req.user.id;
  const { expenseId } = req.params; // Assuming expense ID is passed as a URL parameter

  try {
    
    // Check if the user is involved in the expense
    const isInvolved = await checkUserInvolvement(userId, expenseId);

    if (!isInvolved) {
      return res.status(403).json({ message: "You are not authorized to delete this expense." });
    }


    // Soft delete the expense
    await Expense.update(
      {deleted_by: userId},
      {where: { id: expenseId }}
    );
    await Expense.destroy({
      where: { id: expenseId },
    });
  

    res.status(200).json({ message: "Expense successfully deleted." });
  } catch (error) {
    console.error('Error soft deleting expense:', error);
    next(error);
  }
};
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


//Restore an expense
exports.restoreExpense = async (req, res, next) => {
  const userId = req.user.id;
  const { expenseId } = req.params;

  try {
    // Check if the user is involved in the expense
    const isInvolved = await checkUserInvolvement(userId, expenseId);

    if (!isInvolved) {
      return res.status(403).json({ message: "You are not authorized to restore this expense." });
    }


    // Restore the expense
    await Expense.update(
      {deleted_by: null, },
      {where: { id: expenseId }}
    );
    await Expense.restore({
      where: { id: expenseId },
      logging: console.log
    });

    res.status(200).json({ message: "Expense successfully restored." });
  } catch (error) {
    console.error('Error restoring expense:', error);
    next(error);
  }
};


//Update an expense