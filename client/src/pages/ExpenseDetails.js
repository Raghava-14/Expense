import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ExpenseDetails.css';
import UpdateExpenseForm from '../components/UpdateExpenseForm';

const ExpenseDetailPage = () => {
  const { expenseId } = useParams();
  const [expenseDetails, setExpenseDetails] = useState(null);
  const navigate = useNavigate();
  const [showUpdateForm, setShowUpdateForm] = useState(false);

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
            {expenseDetails.expenseType !== 'personal' && <p><span className="field-name">Split Type:</span> {expenseDetails.splitType}</p>}
            {expenseDetails.groupName && <p><span className="field-name">Group:</span> {expenseDetails.groupName}</p>}
            <p>
              <span className="field-name">Created At : </span>
              {expenseDetails.createdAt} by {expenseDetails.createdBy}
            </p>
            <p>
              <span className="field-name">Updated At : </span>
              {expenseDetails.updatedAt} by {expenseDetails.updatedBy}
            </p>
            {expenseDetails.deletedAt && (
              <>
                <p><span className="field-name">Deleted By:</span> {expenseDetails.deletedBy}</p>
                <p><span className="field-name">Deleted At:</span> {expenseDetails.deletedAt}</p>
              </>
            )}
            {expenseDetails.expenseType !== 'personal' && (
              <div className="shared-details-section">
                <h3 className="shared-details-header">Contribution and Share Details</h3>
                <p><span className="your">Your Contribution:</span> ${expenseDetails.yourContribution}</p>
                <p><span className="your">Your Share:</span> ${expenseDetails.yourShare}</p>
                {expenseDetails.sharedExpensesDetails.map((detail, index) => (
                  <div className="shared-detail" key={index}>
                    <p><span className="field-name">{detail.userName}'s Contribution:</span> ${detail.Contribution}</p>
                    <p><span className="field-name">{detail.userName}'s Share:</span> ${detail.Share}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="edit-button mr-2" onClick={() => setShowUpdateForm(true)}>Edit Expense</button>
          {showUpdateForm && (
            <UpdateExpenseForm
              isOpen={showUpdateForm}
              onRequestClose={() => setShowUpdateForm(false)}
              existingDetails={expenseDetails}
            />
          )}
          {!expenseDetails.deletedAt ? (
            <button className="delete-button mr-2" onClick={handleDelete}>Delete</button>
          ) : (
            <button className="res-button mr-2" onClick={handleRestore}>Restore</button>
          )}
          <button className="back-button mr-2" onClick={() => navigate('/dashboard/expenses') }>Back to Expenses</button> 
        </>
      ) : (
        <p>Loading expense details...</p>
      )}
    </div>
  );
};

export default ExpenseDetailPage;
