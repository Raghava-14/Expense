import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        maxHeight: '90vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '20px'
    }
};

const initialFormData = (existingDetails) => ({
  name: existingDetails ? existingDetails.name : '',
  amount: existingDetails ? existingDetails.amount : '',
  date: existingDetails ? new Date(existingDetails.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  currency_code: existingDetails ? existingDetails.currency_code : 'USD',
  category_id: existingDetails ? existingDetails.category_id : '',
  receipt: existingDetails ? existingDetails.receipt : '',
  split_type: existingDetails ? existingDetails.split_type : 'equal',
  users: existingDetails ? existingDetails.users : [{
    id: '',
    paidAmount: '0',
    owedAmount: '0'
  }],
  group_id: existingDetails ? existingDetails.group_id : ''
});

const UpdateExpenseForm = ({ isOpen, onRequestClose, existingDetails }) => {
  const [formData, setFormData] = useState(initialFormData(existingDetails));
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
          const categoriesRes = await axios.get('http://localhost:3000/api/categories/', { headers: { Authorization: `Bearer ${token}` } });
          setCategories(categoriesRes.data.flatMap(cat => cat.Subcategories.map(sub => ({
            id: sub.id,
            name: `${cat.name} - ${sub.name}`
          }))));
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:3000/api/expenses/${existingDetails.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Expense updated successfully');
      onRequestClose(); // Close the modal
    } catch (error) {
      console.error("Error updating expense:", error);
      alert('Failed to update expense.');
    }
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Update Expense Modal"
    >
      <h2>Update Expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Amount:</label>
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Date:</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Currency:</label>
          <select name="currency_code" value={formData.currency_code} onChange={handleChange}>
            <option value="USD">USD</option>
            <option value="INR">INR</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
        <div className="form-group">
          <label>Category:</label>
          <select name="category_id" value={formData.category_id} onChange={handleChange}>
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <button type="submit">Update Expense</button>
          <button type="button" onClick={onRequestClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateExpenseForm;
