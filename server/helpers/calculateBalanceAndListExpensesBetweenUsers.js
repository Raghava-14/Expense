const { SharedExpense, Expense } = require('../models');
const { Op } = require('sequelize');

async function calculateBalanceAndListExpensesBetweenUsers(currentUserId, peerUserId) {
    if (currentUserId === peerUserId) {
        throw new Error("Current user cannot be the same as peer user.");
    }
    try {
        const expensesCurrent = await SharedExpense.findAll({
            where: { user_id: currentUserId },
            include: [{
                model: Expense,
                as: 'Expense',
                required: true
            }]
        });

        const expensesPeer = await SharedExpense.findAll({
            where: { user_id: peerUserId },
            include: [{
                model: Expense,
                as: 'Expense',
                required: true
            }]
        });

        const peerExpensesMap = expensesPeer.reduce((acc, item) => {
            acc[item.expense_id] = item;
            return acc;
        }, {});

        let netBalance = 0;
        let expensesInvolved = [];

        expensesCurrent.forEach(currentExpense => {
            const peerExpense = peerExpensesMap[currentExpense.expense_id];
            if (peerExpense) {
                const currentUserNet = currentExpense.paid_amount - currentExpense.owed_amount;
                const peerUserNet = peerExpense.paid_amount - peerExpense.owed_amount;

                // Correctly determine the direction of the balance effect
                const balanceForExpense = (currentUserNet - peerUserNet) / 2; // Division by 2 to correct the doubling effect

                netBalance += balanceForExpense;

                expensesInvolved.push({
                    expenseId: currentExpense.Expense.id,
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