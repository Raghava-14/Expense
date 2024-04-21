const { SharedExpense, Expense } = require('../models');
const { Op } = require('sequelize');

async function calculateNetBalanceForUser(userId) {
    let netBalance = 0;

    // Fetch all expenses related to this user, joined with the Expenses table to check for deletions
    const expenses = await SharedExpense.findAll({
        where: {
            user_id: userId
        },
        include: [{
            model: Expense,
            as: 'Expense',
            required: true,
            where: {
                deletedAt: null // Ensuring only non-deleted expenses are considered
            }
        }]
    });
    

    // Calculate net balance, considering only non-deleted expenses
    expenses.forEach(expense => {
        if (expense.Expense.deletedAt === null) { // Double-checking to avoid any unexpected data issues
            // Calculate balance depending on whether the user is the payer or not
            if (expense.user_id === userId && expense.paid_amount > 0) {
                netBalance += (expense.paid_amount - expense.owed_amount);
            } else {
                netBalance -= (expense.owed_amount - expense.paid_amount);
            }
        }
    });

    return { userId: userId, netBalance: netBalance.toFixed(2) };
}

module.exports = calculateNetBalanceForUser;
