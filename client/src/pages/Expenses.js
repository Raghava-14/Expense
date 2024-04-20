import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CreateExpenseForm from '../components/CreateExpenseForm';
import './Expenses.css';

const Expenses = () => {
  // Initialize state to handle three separate lists
  const [expenses, setExpenses] = useState({
    personalExpenses: [],
    sharedExpenses: [],
    groupExpenses: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/api/expenses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses({
          personalExpenses: response.data.personalExpenses.map(expense => ({
            ...expense,
            isDeleted: !!expense.deletedAt,
          })),
          sharedExpenses: response.data.sharedExpenses.map(expense => ({
            ...expense,
            isDeleted: !!expense.deletedAt,
          })),
          groupExpenses: response.data.groupExpenses.map(expense => ({
            ...expense,
            isDeleted: !!expense.deletedAt,
          }))
        });
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  const handleExpenseClick = (expenseId) => {
    navigate(`../expenses/${expenseId}`);
  };

  return (
    <div>
      <h2>My Expenses</h2>
      <button onClick={() => setIsModalOpen(true)} className="create-expense-button">Create Expense</button>
      <CreateExpenseForm isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
  
      <div>
        <h3 className="expense-header">Personal Expenses</h3>
        {expenses.personalExpenses.length > 0 ? (
          <ul className="expense-list">
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
        <h3 className="expense-header">Shared Expenses</h3>
        {expenses.sharedExpenses.length > 0 ? (
          <ul className="expense-list">
            {expenses.sharedExpenses.map((expense) => (
              <li key={expense.id} onClick={() => handleExpenseClick(expense.id)}>
                {expense.date.slice(0, 10)} - {expense.name} - ${expense.amount}
              </li>
            ))}
          </ul>
        ) : (
          <p>No shared expenses found.</p>
        )}
      </div>
      <div>
        <h3 className="expense-header">Group Expenses</h3>
        {expenses.groupExpenses.length > 0 ? (
          <ul className="expense-list">
            {expenses.groupExpenses.map((expense) => (
              <li key={expense.id} onClick={() => handleExpenseClick(expense.id)}>
                {expense.date.slice(0, 10)} - {expense.name} - ${expense.amount}
              </li>
            ))}
          </ul>
        ) : (
          <p>No group expenses found.</p>
        )}
      </div>
    </div>
  );
  
};

export default Expenses;
