import React from 'react';
import MonthlyExpensesByCategory from '../components/MonthlyExpensesByCategory';
import InvestmentExpensesChart from '../components/InvestmentExpensesChart';

const Insights = () => {
  return (
    <div>
      <h2 className="text-xl font-bold">Insights</h2>
      <MonthlyExpensesByCategory />
      <InvestmentExpensesChart />
      {/* Insights content goes here */}
    </div>
  );
};

export default Insights;