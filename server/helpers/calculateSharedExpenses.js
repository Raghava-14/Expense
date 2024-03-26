function calculateSharedExpenses({ amount, splitType, users, groupId, expenseId }) {
    let results = [];
    const totalPaidAmount = users.reduce((acc, user) => acc + parseFloat(user.paidAmount), 0);

    if (totalPaidAmount !== amount) {
        throw new Error('The total paid amount must match the expense amount.');
    }

    switch (splitType) {
        case 'equal':
            const equalShare = amount / users.length; // This remains the same.
            results = users.map(user => ({
            expense_id: expenseId,
            user_id: user.id,
            paid_amount: parseFloat(user.paidAmount),
            owed_amount: parseFloat((equalShare - parseFloat(user.paidAmount)).toFixed(2)),
            group_id: groupId,
            }));
            break;

        case 'exact_amount':
            results = users.map(user => {
                return {
                    expense_id: expenseId,
                    user_id: user.id,
                    paid_amount: parseFloat(user.paidAmount),
                    // Since it's an exact amount, use the provided owed amount directly
                    owed_amount: parseFloat(user.owedAmount),
                    group_id: groupId,
                };
            });
            // Validation to ensure the sum of owed amounts results in 0 when offset by the paid amounts
            const totalOwedAmount = results.reduce((acc, user) => acc + user.owed_amount, 0);
            const netAmount = totalOwedAmount - totalPaidAmount;

            if (netAmount !== 0) {
                throw new Error('The sum of owed amounts must result in 0.');
            }
            break;

        case 'percentage':
                // Ensure the sum of percentages equals 100%
                const totalPercentage = users.reduce((acc, user) => acc + parseFloat(user.owedAmount),0);
                if (totalPercentage !== 100) {
                  throw new Error('The sum of percentages must equal 100%.');
                }
              
                results = users.map(user => {
                  const owedAmountByPercentage = parseFloat(((amount * user.owedAmount) / 100).toFixed(2));
                  return {
                    expense_id: expenseId,
                    user_id: user.id,
                    paid_amount: parseFloat(user.paidAmount),
                    owed_amount: owedAmountByPercentage - parseFloat(user.paidAmount),
                    group_id: groupId,
                  };
                });
            break;
                
        case 'by_shares':
            const totalShares = users.reduce((acc, user) => acc + parseFloat(user.owedAmount), 0);
            if (totalShares < 1) {
                throw new Error('There should be at least 1 share.');
            }
            const amountPerShare = amount / totalShares;
            results = users.map(user => {
                 const owedAmountByShares = parseFloat((amountPerShare * parseFloat(user.owedAmount)).toFixed(2));
                  return {
                    expense_id: expenseId,
                    user_id: user.id,
                    paid_amount: parseFloat(user.paidAmount),
                    owed_amount: owedAmountByShares - parseFloat(user.paidAmount),
                    group_id: groupId,
                };
            });
            break;

        default:
            throw new Error('Invalid split type');
    }
    
    //console.log("Shared Expenses Data:", results); // Log the results
    return results;
}

module.exports = calculateSharedExpenses;
