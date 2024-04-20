import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ExpenseDetails.css';

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
      navigate('/dashboard/expenses');
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
      fetchExpenseDetails();
    } catch (error) {
      console.error("Error restoring expense:", error);
    }
  };

  return (
    <div className="detail-card">
      {expenseDetails ? (
        <>
          <h2 className="detail-header">Expense Details</h2>
          <div className="detail-body">
            <p><span className="field-name">Name:</span> {expenseDetails.name}</p>
            <p><span className="field-name">Amount:</span> ${expenseDetails.amount}</p>
            <p><span className="field-name">Date:</span> {new Date(expenseDetails.date).toLocaleDateString()}</p>
            <p><span className="field-name">Category:</span> {expenseDetails.categoryName}</p>
            <p><span className="field-name">Created At:</span> {expenseDetails.createdAt}</p>
            <p><span className="field-name">Updated At:</span> {expenseDetails.updatedAt}</p>
            {expenseDetails.deletedAt && (
              <>
                <p><span className="field-name">Deleted By:</span> {expenseDetails.deletedBy}</p>
                <p><span className="field-name">Deleted At:</span> {expenseDetails.deletedAt}</p>
              </>
            )}
            {expenseDetails.sharedExpensesDetails && (
              <>
              <p><span className="field-name">Created By:</span> {expenseDetails.createdBy}</p>
              <p><span className="field-name">Updated By:</span> {expenseDetails.updatedBy}</p>
                <h3 className="shared-details-header">Shared Details</h3>
                <div className="shared-details-container">
                  {expenseDetails.sharedExpensesDetails.map((detail, index) => (
                    <div className="shared-detail" key={index}>
                      <p><span className="field-name">User Name:</span> {detail.userName}</p>
                      <p><span className="field-name">Contribution:</span> ${detail.Contribution}</p>
                      <p><span className="field-name">Share:</span> ${detail.Share}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {!expenseDetails.deletedAt ? (
            <button className="button button-alert" onClick={handleDelete}>Delete</button>
          ) : (
            <button className="button button-primary" onClick={handleRestore}>Restore</button>
          )}
          <button className="button button-secondary" onClick={() => navigate('/dashboard/expenses')}>Back to Expenses</button>
        </>
      ) : (
        <p>Loading expense details...</p>
      )}
    </div>
  );


};

export default ExpenseDetailPage;
