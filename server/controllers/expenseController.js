const { Expense, SharedExpense, Group, GroupMember, User, Category, sequelize } = require('../models'); 
const { Op, literal, fn, col } = require('sequelize');
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
        
        // Actual creation of the expense
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


// View All Expenses
exports.getExpenses = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const allExpenses = await Expense.findAll({
      where: {
        [Op.or]: [
          { created_by: userId },
          { '$SharedExpenses.user_id$': userId }
        ],
      },
      include: [
        {
          model: SharedExpense,
          as: 'SharedExpenses',
          required: false,
          where: { user_id: userId },
          paranoid: false,
          include: [
            { model: User, as: 'User', attributes: ['id', 'first_name'] },
            { model: Group, as: 'Group', attributes: ['name'] }
          ]
        },
        { model: Category, as: 'Category', attributes: ['name'] }
      ],
      attributes: ['id', 'name', 'amount', 'date', 'split_type', 'category_id', 'expense_type', 'created_by', 'deletedAt'],
      paranoid: false,
      order: [['date', 'DESC']]
    });

    let personalExpenses = [];
    let sharedAndGroupExpenses = [];

    allExpenses.forEach(expense => {
      const formattedExpense = formatExpenseResponse(expense, userId); // Pass userId as an argument
      if (expense.expense_type === 'personal') {
        personalExpenses.push(formattedExpense);
      } else {
        sharedAndGroupExpenses.push(formattedExpense);
      }
    });

    res.status(200).json({
      personalExpenses,
      sharedAndGroupExpenses
    });
  } catch (error) {
    console.error('Error viewing expenses:', error);
    next(error);
  }
};

// Adjust the helper function to accept userId as a parameter
function formatExpenseResponse(expense, userId) {
  let expenseResponse = {
    type: expense.expense_type,
    id: expense.id,
    name: expense.name,
    amount: expense.amount,
    date: expense.date,
    splitType: expense.split_type,
    categoryId: expense.category_id,
    expenseType: expense.expense_type,
    category: expense.Category?.name
  };

  if (expense.expense_type !== 'personal') {
    // Correctly use the find method to search for the SharedExpense entry that matches the userId
    const sharedExpense = expense.SharedExpenses.find(se => se.user_id === userId) || {};
    expenseResponse.yourContribution = sharedExpense.paid_amount || null;
    expenseResponse.yourShare = sharedExpense.owed_amount || null;
    if (sharedExpense.Group) {
      expenseResponse.groupName = sharedExpense.Group.name; // Now correctly referenced
    }
  }

  return expenseResponse;
}


// View details of a specific expense
exports.getExpenseDetails = async (req, res, next) => {
  const userId = req.user.id;
  const { expenseId } = req.params;

  try {
    // Fetch the expense, regardless of type
    const expense = await Expense.findOne({
      where: { id: expenseId },
      paranoid: false,
      attributes: ['id', 'name', 'amount', 'date', 'split_type', 'category_id', 'expense_type', 'createdAt', 'updated_by','updatedAt', 'deleted_by', 'deletedAt'],
      include: [
        {
          model: Category,
          attributes: ['name'],
        },
        {
          model: SharedExpense,
          as: 'SharedExpenses',
          attributes: ['paid_amount', 'owed_amount'],
          include: [{ // Include user details for shared expenses
            model: User, as: 'User', attributes: ['first_name'] },
            { model: Group, as: 'Group', attributes: ['name'] }
          ],
          required: false,
        },
        { // Include creator's first name for all expenses
          model: User,
          as: 'Creator',
          attributes: ['first_name'],
        },
        { // Include Updater's first name for all expenses
          model: User,
          as: 'Updater',
          attributes: ['first_name'],
        },
        { // Include Deleter's first name for all expenses
          model: User,
          as: 'Deleter',
          attributes: ['first_name'],
        }
      ],
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    // Prepare the response object based on expense type
    let expenseDetails = {
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      date: expense.date,
      categoryId: expense.category_id,
      expenseType: expense.expense_type,
      categoryName: expense.Category.name,
      splitType: expense.split_type,
      createdAt: expense.createdAt.toISOString().split('T')[0], // Just the date part
      createdBy: expense.Creator?.first_name, // Creator's first name
      updatedAt: expense.updatedAt.toISOString().split('T')[0],
      updatedBy: expense.Updater?.first_name,
      deletedBy: expense.Deleter?.first_name,
      deletedAt: expense.deletedAt?.toISOString().split('T')[0],
    };

    if (expense.expense_type === 'personal') {
      // Exclude split_type for personal expenses
      delete expenseDetails.splitType;
    } else {
      // For shared or group expenses, include user contributions and shares
      expenseDetails.sharedExpensesDetails = expense.SharedExpenses.map(sharedExpense => ({
        userName: sharedExpense.User.first_name,
        Contribution: sharedExpense.paid_amount,
        Share: sharedExpense.owed_amount,
      }));

      if (expense.expense_type === 'group') {
        // Additional detail for group expenses
        expenseDetails.groupName = expense.Group?.name;
      }
    }

    res.status(200).json({ expenseDetails });
  } catch (error) {
    console.error('Error viewing expense details:', error);
    next(error);
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
    })
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


//Categorize expenses for a month
exports.getMonthlyExpensesByCategory = async (req, res) => {
  const userId = req.user.id;
  const { year, month, expenseType } = req.query;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  try {
      // Personal Expenses
      let personalExpensesQuery = {};
      if (expenseType === 'personal' || expenseType === 'both') {
          personalExpensesQuery = {
              created_by: userId,
              date: { [Op.between]: [startDate, endDate] },
              expense_type: 'personal'
          };
      }

      // Shared or Group Expenses
      let sharedExpensesQuery = {};
      if (expenseType === 'shared' || expenseType === 'group' || expenseType === 'both') {
          sharedExpensesQuery = {
              expense_type: { [Op.or]: ['shared', 'group'] },
              '$SharedExpenses.user_id$': userId,
              '$SharedExpenses.paid_amount$': { [Op.gt]: 0 }
          };
      }

      // Query Expenses Table
      const expenses = await Expense.findAll({
          attributes: [
              [fn('SUM', literal('CASE WHEN "expense_type" = \'personal\' THEN "amount" ELSE "SharedExpenses"."paid_amount" END')), 'totalAmount'],
              'category_id',
              [literal('"Category"."name"'), 'categoryName'],
          ],
          where: {
              [Op.or]: [personalExpensesQuery, sharedExpensesQuery],
              date: { [Op.between]: [startDate, endDate] }
          },
          include: [{
              model: SharedExpense,
              as: 'SharedExpenses',
              attributes: [],
              required: false,
          }, {
              model: Category,
              attributes: [],
          }],
          group: ['category_id', 'Category.name'],
          raw: true,
      });

      // Aggregate total spent
      const totalAmountSpent = expenses.reduce((acc, { totalAmount }) => acc + parseFloat(totalAmount || 0), 0).toFixed(2);

      res.json({
          data: {
              totalAmountSpent,
              categoriesBreakdown: expenses.map(expense => ({
                  categoryId: expense.category_id,
                  categoryName: expense.categoryName,
                  amount: parseFloat(expense.totalAmount).toFixed(2)
              }))
          }
      });
  } catch (error) {
      console.error('Error fetching monthly investment expenses:', error);
      res.status(500).send({ message: "Failed to fetch monthly investment expenses." });
  }
};



//Investments made in a month
exports.getMonthlyInvestmentExpenses = async (req, res) => {
    const userId = req.user.id;
    const { year, month, expenseType } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    try {
        // Personal Expenses
        let personalExpensesQuery = {};
        if (expenseType === 'personal' || expenseType === 'both') {
            personalExpensesQuery = {
                created_by: userId,
                date: { [Op.between]: [startDate, endDate] },
                expense_type: 'personal',
                category_id: { [Op.in]: [7, 56, 57, 58, 59, 60, 61, 62, 63] }
            };
        }

        // Shared or Group Expenses
        let sharedExpensesQuery = {};
        if (expenseType === 'shared' || expenseType === 'group' || expenseType === 'both') {
            sharedExpensesQuery = {
                expense_type: { [Op.or]: ['shared', 'group'] },
                '$SharedExpenses.user_id$': userId,
                '$SharedExpenses.paid_amount$': { [Op.gt]: 0 },
                category_id: { [Op.in]: [7, 56, 57, 58, 59, 60, 61, 62, 63] }
            };
        }

        // Query Expenses Table
        const expenses = await Expense.findAll({
            attributes: [
                [fn('SUM', literal('CASE WHEN "expense_type" = \'personal\' THEN "amount" ELSE "SharedExpenses"."paid_amount" END')), 'totalAmount'],
                'category_id',
                [literal('"Category"."name"'), 'categoryName'],
            ],
            where: {
                [Op.or]: [personalExpensesQuery, sharedExpensesQuery],
                date: { [Op.between]: [startDate, endDate] }
            },
            include: [{
                model: SharedExpense,
                as: 'SharedExpenses',
                attributes: [],
                required: false,
            }, {
                model: Category,
                attributes: [],
            }],
            group: ['category_id', 'Category.name'],
            raw: true,
        });

        // Aggregate total spent
        const totalAmountSpent = expenses.reduce((acc, { totalAmount }) => acc + parseFloat(totalAmount || 0), 0).toFixed(2);

        res.json({
            message: "Monthly investment expenses retrieved successfully",
            data: {
                totalAmountSpent,
                categoriesBreakdown: expenses.map(expense => ({
                    categoryId: expense.category_id,
                    categoryName: expense.categoryName,
                    amount: parseFloat(expense.totalAmount).toFixed(2)
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching monthly investment expenses:', error);
        res.status(500).send({ message: "Failed to fetch monthly investment expenses." });
    }
};

