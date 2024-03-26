// controllers/expenseController.js 

const { Expense, SharedExpense, GroupMember, User, sequelize, Balance } = require('../models'); 
const calculateSharedExpenses = require('../helpers/calculateSharedExpenses'); 
//const updateBalances = require('../helpers/updateBalances'); 
//const updateBalancesForSettlement = require('../helpers/updateBalancesForSettlement'); // Implement this 

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
  
          // Update balances based on shared expenses data
          //await updateBalances(sharedExpensesData, t);
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
