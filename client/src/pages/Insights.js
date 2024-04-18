import React from 'react';
import NetBalance from '../components/NetBalance';
import MonthlyExpensesByCategory from '../components/MonthlyExpensesByCategory';

const Insights = () => {
  return (
    <div>
      <h2 className="text-xl font-bold">Insights</h2>
      <NetBalance />
      <MonthlyExpensesByCategory />
      {/* Insights content goes here */}
    </div>
  );
};

export default Insights;