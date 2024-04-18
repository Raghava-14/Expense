import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './MonthlyExpensesByCategory.css'; // Ensure CSS is properly imported

const months = [
  { name: 'January', number: 1 },
  { name: 'February', number: 2 },
  { name: 'March', number: 3 },
  { name: 'April', number: 4 },
  { name: 'May', number: 5 },
  { name: 'June', number: 6 },
  { name: 'July', number: 7 },
  { name: 'August', number: 8 },
  { name: 'September', number: 9 },
  { name: 'October', number: 10 },
  { name: 'November', number: 11 },
  { name: 'December', number: 12 }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, index) => currentYear - index); // Last 10 years

const MonthlyExpensesByCategory = () => {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [expenseType, setExpenseType] = useState('personal');
  const [expenses, setExpenses] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:3000/api/expenses/expenses-by-category?year=${year}&month=${month}&expenseType=${expenseType}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [year, month, expenseType]);

  // Data for the pie chart
  const pieData = {
    labels: expenses?.categoriesBreakdown.map(item => item.categoryName),
    datasets: [{
      data: expenses?.categoriesBreakdown.map(item => item.amount),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#F7464A', '#AC64AD'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#F7464A', '#AC64AD']
    }]
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  return (
    <div className="container">
      <div className="data-section">
        <h2>Expenses by Category</h2>
        <div className="filters">
          <label>Year:
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
          <label>Month:
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
              {months.map((m) => (
                <option key={m.number} value={m.number}>{m.name}</option>
              ))}
            </select>
          </label>
          <label>Expense Type:
            <select value={expenseType} onChange={(e) => setExpenseType(e.target.value)}>
              <option value="personal">Personal</option>
              <option value="shared">Shared</option>
            </select>
          </label>
        </div>
        {loading ? <p>Loading...</p> : (
          <div className="expense-summary">
            <div className="total-spent">
              <h3>Total Amount Spent: ${expenses?.totalAmountSpent}</h3>
            </div>
            <div className="category-cards">
              {expenses?.categoriesBreakdown.map(category => (
                <div key={category.categoryId} className="category-card">
                  <h4>{category.categoryName}</h4>
                  <p>${category.amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="chart-section">
        <Pie data={pieData} options={options} />
      </div>
    </div>
  );
};

export default MonthlyExpensesByCategory;
