const { SharedExpense } = require('../models');
const { Op } = require('sequelize');

async function calculateNetBalanceForUser(userId) {
  let netBalance = 0;

  // Fetch all expenses related to this user, either paid by or owed to them
  const expenses = await SharedExpense.findAll({
    where: {
      [Op.or]: [
        { user_id: userId },
      ]
    }
  });

  // Calculate net balance
  expenses.forEach(expense => {
    // If the user is the payer, add owed_amount to their net balance
    if (expense.user_id === userId && expense.owed_amount < 0) {
      netBalance += Math.abs(expense.owed_amount);
    }
    // If the user owes money, subtract it from their net balance
    if (expense.user_id === userId && expense.owed_amount > 0) {
      netBalance -= expense.owed_amount;
    }
  });

  return { userId: userId, netBalance: netBalance.toFixed(2) };
}

module.exports = calculateNetBalanceForUser;
