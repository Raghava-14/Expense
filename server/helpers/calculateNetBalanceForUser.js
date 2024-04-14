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
    if (expense.user_id === userId && expense.paid_amount > 0) {
      netBalance += (expense.paid_amount - expense.owed_amount);
      console.log("netBalance: ", netBalance);
    }else{
      netBalance -= (expense.owed_amount - expense.paid_amount);
      console.log("netBalance: ", netBalance);
    }
    
  });

  return { userId: userId, netBalance: netBalance.toFixed(2) };
}

module.exports = calculateNetBalanceForUser;
