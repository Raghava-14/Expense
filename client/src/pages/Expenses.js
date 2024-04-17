import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import CreateExpenseForm from '../components/CreateExpenseForm';

const Expenses = () => {
  const [expenses, setExpenses] = useState({ personalExpenses: [], sharedAndGroupExpenses: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); // Use the useNavigate hook

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/api/expenses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming the API response includes all expenses, with a 'deletedAt' field indicating soft deletion
        setExpenses({
          personalExpenses: response.data.personalExpenses.map(expense => ({
            ...expense,
            isDeleted: !!expense.deletedAt, // Add a flag to indicate if the expense is deleted
          })),
          sharedAndGroupExpenses: response.data.sharedAndGroupExpenses.map(expense => ({
            ...expense,
            isDeleted: !!expense.deletedAt, // Same flag for shared and group expenses
          })),
        });
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
  
    fetchExpenses();
  }, []);

  // Modify handleExpenseClick to navigate to the detail page
  const handleExpenseClick = (expenseId) => {
    navigate(`../expenses/${expenseId}`);
  };

  return (
    <div>
      <h2>My Expenses</h2>
      <button onClick={() => setIsModalOpen(true)}>Create Expense</button>
      <CreateExpenseForm isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
      <div>
        <h3>Personal Expenses</h3>
        {expenses.personalExpenses.length > 0 ? (
          <ul>
            {expenses.personalExpenses.map((expense) => (
              <li key={expense.id} onClick={() => handleExpenseClick(expense.id)}>
                {expense.date.slice(0, 10)} - {expense.name} - ${expense.amount}
              </li>
            ))}
          </ul>
        ) : (
          <p>No personal expenses found.</p>
        )}
      </div>
      <div>
        <h3>Shared and Group Expenses</h3>
        {expenses.sharedAndGroupExpenses.length > 0 ? (
          <ul>
            {expenses.sharedAndGroupExpenses.map((expense) => (
              <li key={expense.id} onClick={() => handleExpenseClick(expense.id)}>
              {expense.date.slice(0, 10)} - {expense.name} - ${expense.amount}
            </li>
            ))}
          </ul>
        ) : (
          <p>No shared or group expenses found.</p>
        )}
      </div>
    </div>
  );
};

export default Expenses;
