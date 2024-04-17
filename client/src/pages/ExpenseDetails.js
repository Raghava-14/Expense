import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ExpenseDetailPage = () => {
  const { expenseId } = useParams();
  const [expenseDetails, setExpenseDetails] = useState(null);
  const navigate = useNavigate();

  const fetchExpenseDetails = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:3000/api/expenses/${expenseId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenseDetails(response.data.expenseDetails);
    } catch (error) {
      console.error("Error fetching expense details:", error);
    }
  }, [expenseId]);

  useEffect(() => {
    fetchExpenseDetails();
  }, [fetchExpenseDetails]);

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:3000/api/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Expense successfully deleted');
      navigate('/dashboard/expenses'); // Adjust the navigation path as needed
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleRestore = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:3000/api/expenses/${expenseId}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Expense successfully restored');
      fetchExpenseDetails(); // Refresh the expense details
    } catch (error) {
      console.error("Error restoring expense:", error);
    }
  };

  return (
    <div>
      {expenseDetails ? (
        <div>
          <h2>Expense Details</h2>
          <p>Name: {expenseDetails.name}</p>
          <p>Amount: ${expenseDetails.amount}</p>
          <p>Date: {new Date(expenseDetails.date).toLocaleDateString()}</p>
          <p>Category: {expenseDetails.categoryName}</p>
          <p>Created At: {expenseDetails.createdAt}</p>
          <p>Updated At: {expenseDetails.updatedAt}</p>
          {expenseDetails.deletedAt && (
            <>
              <p>Deleted By: {expenseDetails.deletedBy}</p>
              <p>Deleted At: {expenseDetails.deletedAt}</p>
            </>
          )}
          {expenseDetails.sharedExpensesDetails && (
            <>
            <p>Created By: {expenseDetails.createdBy}</p>
            <p>Updated By: {expenseDetails.updatedBy}</p>
              <h3>Shared Details</h3>
              {expenseDetails.sharedExpensesDetails.map((detail, index) => (
                <div key={index}>
                  <p>User Name: {detail.userName}</p>
                  <p>Contribution: ${detail.Contribution}</p>
                  <p>Share: ${detail.Share}</p>
                </div>
              ))}
            </>
          )}
          {!expenseDetails.deletedAt ? (
            <button onClick={handleDelete}>Delete</button>
          ) : (
            <button onClick={handleRestore}>Restore</button>
          )}
          <button onClick={() => navigate('/dashboard/expenses')}>Back to Expenses</button>
        </div>
      ) : (
        <p>Loading expense details...</p>
      )}
    </div>
  );
};

export default ExpenseDetailPage;
