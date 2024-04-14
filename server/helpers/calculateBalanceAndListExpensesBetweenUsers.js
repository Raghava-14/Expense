const { SharedExpense, Expense } = require('../models');
const { Op } = require('sequelize');

async function calculateBalanceAndListExpensesBetweenUsers(currentUserId, peerUserId) {
    // Validation to ensure current user is not equal to peer user
    if (currentUserId === peerUserId) {
        throw new Error("Current user cannot be the same as peer user.");
    }
  try {
    // Fetch all expenses involving both the current user and the peer user
    const sharedExpensesCurrent = await SharedExpense.findAll({
      where: { user_id: currentUserId },
      include: [{ model: Expense, as: 'Expense' }]
    });

    const sharedExpensesPeer = await SharedExpense.findAll({
      where: { user_id: peerUserId },
      include: [{ model: Expense, as: 'Expense' }]
    });

    let netBalance = 0;
    let expensesInvolved = [];

    sharedExpensesCurrent.forEach(currentExpense => {
      const peerExpense = sharedExpensesPeer.find(pe => pe.expense_id === currentExpense.expense_id);
      
      if (peerExpense) {
        let balanceForExpense = 0;
        // If the current user paid for the expense
        if (currentExpense.paid_amount > 0) {
          balanceForExpense = -parseFloat(peerExpense.owed_amount);
        } 
        // If the peer user paid for the expense
        if (peerExpense.paid_amount > 0) {
          balanceForExpense = parseFloat(currentExpense.owed_amount);
        }
        
        netBalance += balanceForExpense;

        expensesInvolved.push({
          expenseId: currentExpense.expense_id,
          name: currentExpense.Expense.name,
          date: currentExpense.Expense.date,
          splitType: currentExpense.Expense.split_type,
          balance: balanceForExpense.toFixed(2)
        });
      }
    });

    return {
      net_balance: netBalance.toFixed(2),
      expensesInvolved
    };

  } catch (error) {
    console.error('Error calculating balance and listing expenses:', error);
    throw error;
  }
}

module.exports = calculateBalanceAndListExpensesBetweenUsers;
