import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CreateExpenseForm from '../components/CreateExpenseForm';
import './Expenses.css';

const Expenses = () => {
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
          personalExpenses: response.data.personalExpenses,
          sharedExpenses: response.data.sharedExpenses,
          groupExpenses: response.data.groupExpenses
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
      <h2 className="title">My Expenses</h2>
      <button onClick={() => setIsModalOpen(true)} className="create-expense-button">Create Expense</button>
      <CreateExpenseForm isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />

      {['personalExpenses', 'sharedExpenses', 'groupExpenses'].map((category) => (
        <div key={category}>
          <h3 className="expense-header">{category.replace(/Expenses$/, ' Expenses')}</h3>
          {expenses[category].length > 0 ? (
            <ul className="expense-list">
              {expenses[category].map((expense) => (
                <li key={expense.id} onClick={() => handleExpenseClick(expense.id)}
                    className={`expense-item ${expense.deletedAt ? 'deleted' : ''}`}>
                  {expense.date.slice(0, 10)} - {expense.name} - ${expense.amount}
                </li>
              ))}
            </ul>
          ) : (
            <p>No expenses found in this category.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Expenses;
