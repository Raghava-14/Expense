import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateExpenseForm = ({ onExpenseCreated, onCancel }) => {
  const [expenseType, setExpenseType] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    currency_code: 'USD',
    category_id: '',
    group_id: '',
    split_type: 'equal',
    sharedDetails: []
  });
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [categoriesRes, groupsRes, friendsRes] = await Promise.all([
          axios.get('http://localhost:3000/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/groups/my-groups', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/friendships/list-friends', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setCategories(categoriesRes.data);
        setGroups(groupsRes.data);
        setFriends(friendsRes.data);
      } catch (error) {
        console.error('Error fetching data: ', error);
        setFeedback('Failed to fetch dropdown data. Please try again.');
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSharedDetailsChange = (index, field, value) => {
    const updatedSharedDetails = [...formData.sharedDetails];
    updatedSharedDetails[index] = { ...updatedSharedDetails[index], [field]: value };
    setFormData({ ...formData, sharedDetails: updatedSharedDetails });
  };

  const addSharedDetail = () => {
    setFormData({
      ...formData,
      sharedDetails: [...formData.sharedDetails, { user_id: '', paid_amount: 0, owed_amount: 0 }]
    });
  };

  const removeSharedDetail = (index) => {
    const filteredSharedDetails = formData.sharedDetails.filter((_, i) => i !== index);
    setFormData({ ...formData, sharedDetails: filteredSharedDetails });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
  
    // Initialize payload with formData
    let payload = { ...formData };
  
    // Adjust the payload based on the expense type
    switch (expenseType) {
      case 'personal':
        delete payload.group_id;
        delete payload.sharedDetails;
        break;
      case 'shared':
      case 'group':
        // Ensure sharedDetails is formatted correctly for shared and group types
        payload.sharedDetails = formData.sharedDetails.map(detail => ({
          userId: detail.user_id,
          paidAmount: detail.paid_amount,
          owedAmount: detail.owed_amount,
        }));
        if (expenseType === 'shared') {
          delete payload.group_id; // Remove group_id for shared expenses
        }
        break;
      default:
        // Handle any other expense types if necessary
        break;
    };
  
    try {
      const response = await axios.post('http://localhost:3000/api/expenses', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Utilize response here if needed, for example:
      setFeedback({ message: 'Expense created successfully!', type: 'success' });
      onExpenseCreated(); // Refresh or reset form as needed
      onCancel(); // Close form or perform additional cleanup
    } catch (error) {
      setFeedback({ message: error.response?.data?.message || 'Failed to create expense.', type: 'error' });
    }
  };
  


  return (
    <div>
      <h2>Create Expense</h2>
      {feedback.message && (
        <p style={{ color: feedback.type === 'error' ? 'red' : 'green' }}>{feedback.message}</p>
      )}
      <form onSubmit={handleSubmit}>
        {/* Expense Type Selection */}
        <div>
          <label>
            <input
              type="radio"
              name="expenseType"
              value="personal"
              checked={expenseType === 'personal'}
              onChange={() => setExpenseType('personal')}
            /> Personal
          </label>
          <label>
            <input
              type="radio"
              name="expenseType"
              value="shared"
              checked={expenseType === 'shared'}
              onChange={() => setExpenseType('shared')}
            /> Shared
          </label>
          <label>
            <input
              type="radio"
              name="expenseType"
              value="group"
              checked={expenseType === 'group'}
              onChange={() => setExpenseType('group')}
            /> Group
          </label>
        </div>
  
        {/* Common Fields */}
        <div>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Expense Name"
            required
          />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Amount"
            required
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
          <select name="currency_code" value={formData.currency_code} onChange={handleInputChange} required>
            <option value="USD">USD</option>
            <option value="INR">INR</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
          <select name="category_id" value={formData.category_id} onChange={handleInputChange}>
            <option value="">Select Category</option>
            {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
  
        {/* Shared and Group Specific Fields */}
        {expenseType !== 'personal' && (
          <div>
            <select name="split_type" value={formData.split_type} onChange={handleInputChange} required>
              <option value="equal">Equal</option>
              <option value="exact_amount">Exact Amount</option>
              <option value="percentage">Percentage</option>
              <option value="by_shares">By Shares</option>
            </select>
  
            {/* Dynamic Shared Details Fields */}
            {formData.sharedDetails.map((detail, index) => (
              <div key={index}>
                <select name="user_id" value={detail.user_id} onChange={(e) => handleSharedDetailsChange(index, 'user_id', e.target.value)} required>
                  <option value="">Select Friend</option>
                  {friends.map(friend => (
                    <option key={friend.id} value={friend.id}>{friend.first_name}</option>
                  ))}
                </select>
                <input type="number" name="paid_amount" value={detail.paid_amount} onChange={(e) => handleSharedDetailsChange(index, 'paid_amount', e.target.value)} placeholder="Paid Amount" required />
                {formData.split_type !== 'equal' && (
                  <input type="number" name="owed_amount" value={detail.owed_amount} onChange={(e) => handleSharedDetailsChange(index, 'owed_amount', e.target.value)} placeholder={formData.split_type === 'percentage' ? 'Percentage' : 'Owed Amount'} required />
                )}
                <button type="button" onClick={() => removeSharedDetail(index)}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addSharedDetail}>Add Friend</button>
          </div>
        )}
  
        {/* Group Dropdown for Group Expense */}
        {expenseType === 'group' && (
          <select name="group_id" value={formData.group_id} onChange={handleInputChange} required>
            <option value="">Select Group</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        )}
  
        {/* Actions */}
        <div>
      {/* Feedback message */}
      {feedback.message && (
        <p style={{ color: feedback.type === 'error' ? 'red' : 'green' }}>{feedback.message}</p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Form fields and buttons here */}
        <button type="submit">Create Expense</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
      </form>
    </div>
  );
};

export default CreateExpenseForm;
