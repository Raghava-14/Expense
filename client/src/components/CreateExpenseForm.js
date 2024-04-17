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
      display: 'flex',     // Enable flex container
      flexDirection: 'column',  // Stack children vertically
      alignItems: 'stretch',  // Align children to stretch full width of the container
      padding: '20px'  // Add some padding around the content
    }
  };
  

const initialFormData = () => ({
  name: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10), // Default to today's date
  currency_code: 'USD',
  category_id: '',
  receipt: '',
  split_type: 'equal',
  users: [{
    id: '',
    paidAmount: '0',
    owedAmount: '0'
  }],
  group_id: ''
});

const CreateExpenseForm = ({ isOpen, onRequestClose }) => {
  const [expenseType, setExpenseType] = useState('personal');
  const [formData, setFormData] = useState(initialFormData);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [friendsRes, groupsRes, categoriesRes, userRes] = await Promise.all([
          axios.get('http://localhost:3000/api/friendships/list-friends', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/groups/my-groups', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/categories/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setFriends(friendsRes.data);
        setGroups(groupsRes.data);
        setCategories(categoriesRes.data.flatMap(cat => cat.Subcategories.map(sub => ({
          id: sub.id,
          name: `${cat.name} - ${sub.name}`
        }))));
        setCurrentUser(userRes.data);
        setFormData(formData => ({
          ...formData,
          users: [{
            id: userRes.data.id,
            paidAmount: '0',
            owedAmount: '0',
            name: userRes.data.first_name
          }]
        })); // Initialize users with current user ID
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData()); // Reset form data when modal closes
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        users: [{
          id: currentUser.id, // Ensure the current user's ID is used
          paidAmount: '0',
          owedAmount: '0'
        }]
      }));
    }
  }, [currentUser]); // Dependency on currentUser being loaded
  

  const handleExpenseTypeChange = (e) => {
    const newType = e.target.value;
    setExpenseType(newType);
    if (newType === 'personal') {
      setFormData({
        ...initialFormData(),
        expense_type: newType
      });
    } else {
      if (!formData.users.length || formData.users[0].id !== currentUser.id) {
        setFormData(prev => ({
          ...prev,
          expense_type: newType,
          users: [{
            id: currentUser.id,
            paidAmount: '0',
            owedAmount: '0'
          }]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          expense_type: newType
        }));
      }
    }
    if (newType === 'shared' || newType === 'group') {
        addUserField(); // Automatically add a user field if none exist
      }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Convert numerical values to floats for amount fields
    if (name === 'amount' || name === 'paidAmount' || name === 'owedAmount') {
        formattedValue = parseFloat(value) || 0; // Default to 0 if conversion fails
    }

    // Convert IDs to integers
    if (name === 'category_id' || name === 'group_id') {
        formattedValue = parseInt(value, 10) || null; // Default to null if conversion fails
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
};

const handleUserChange = (index, field, value) => {
    let formattedValue = value;
    // Converting numeric values to the correct type
    if (field === 'paidAmount' || field === 'owedAmount') {
        formattedValue = parseFloat(value) || 0;
    }

    if (field === 'id') {
        formattedValue = parseInt(value, 10) || null;
    }

    setFormData(prev => {
        const updatedUsers = prev.users.map((user, idx) => {
            if (idx === index) {
                return { ...user, [field]: formattedValue };
            }
            return user;
        });
        return { ...prev, users: updatedUsers };
    });
};
  
  

const addUserField = () => {
    setFormData(prev => ({
        ...prev,
        users: [...prev.users, { id: null, paidAmount: 0, owedAmount: 0 }]
    }));
};
  

  const removeUserField = (index) => {
    const filteredUsers = formData.users.filter((_, idx) => idx !== index);
    setFormData(prev => ({ ...prev, users: filteredUsers }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || formData.users.some(user => !user.id)) {
      alert("Please fill in all required fields and ensure all users are selected.");
      return;
    }
  
    const payload = {
      name: formData.name,
      amount: formData.amount,
      date: formData.date,
      currency_code: formData.currency_code,
      category_id: formData.category_id,
      expense_type: expenseType, // Directly use state
      ...(expenseType !== 'personal' && {
        group_id: formData.group_id || undefined,
        sharedDetails: {
          splitType: formData.split_type,
          users: formData.users.map(user => ({
            id: user.id, // Ensure IDs are properly sent
            paidAmount: user.paidAmount || '0',
            owedAmount: user.owedAmount || '0'
          }))
        }
      })
    };

    const validUsers = formData.users.every(user => user.id && user.paidAmount !== undefined);
    if (!validUsers) {
        alert("Some users are missing IDs or payment details.");
        return;
    }

    console.log("Payload being sent:", JSON.stringify(payload));
  
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:3000/api/expenses', payload, {
        headers: { Authorization: `Bearer ${token}` }
      }); 
      alert('Expense created successfully');
      onRequestClose(); // Close the modal
      window.location.reload(); // Refresh the page to show new data
    } catch (error) {
      console.error("Error creating expense:", error);
      alert('Failed to create expense.');
    }
  };
  
  

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Create Expense Modal"
    >
      <h2>Create New Expense</h2>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-control">
          <label>Expense Type:
            <div>
              <label><input type="radio" name="expenseType" value="personal" checked={expenseType === 'personal'} onChange={handleExpenseTypeChange} /> Personal</label>
              <label><input type="radio" name="expenseType" value="shared" checked={expenseType === 'shared'} onChange={handleExpenseTypeChange} /> Shared</label>
              <label><input type="radio" name="expenseType" value="group" checked={expenseType === 'group'} onChange={handleExpenseTypeChange} /> Group</label>
            </div>
          </label>
        </div>
        <div className="form-control">Name:<input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter expense name" /></div>
        <div className="form-control">Amount:<input type="number" name="amount" value={formData.amount} onChange={handleChange} required placeholder="Enter amount" /></div>
        <div className="form-control">Date:<input type="date" name="date" value={formData.date} onChange={handleChange} placeholder="Select date" /></div>
        <div className="form-control">Currency:
          <select name="currency_code" value={formData.currency_code} onChange={handleChange}>
            <option value="">Select Currency</option>
            <option value="USD">USD</option>
            <option value="INR">INR</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
        <div className="form-control">Category:
          <select name="category_id" value={formData.category_id} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        {renderExpenseTypeSpecificFields()}
        <button type="submit">Create Expense</button>
        <button type="button" onClick={onRequestClose}>Cancel</button>
      </form>
    </Modal>
  );
  
  
  function renderExpenseTypeSpecificFields() {
    if (expenseType === 'personal') return null;
  
    // Helper function to determine the label based on the split type
    const determineOweLabel = (splitType) => {
      switch (splitType) {
        case 'percentage':
          return 'Percentage:';
        case 'by_shares':
          return 'Number of shares:';
        case 'exact_amount':
          return 'Owed Amount:';
        default:
          return 'Amount you owe'; // Default case for 'equal', can be hidden if not necessary
      }
    };
  
    return (
      <div>
        <label>Split Type:
          <select name="split_type" value={formData.split_type} onChange={handleChange}>
            <option value="equal">Equal</option>
            <option value="exact_amount">Exact Amount</option>
            <option value="percentage">Percentage</option>
            <option value="by_shares">By Shares</option>
          </select>
        </label>
        {/* Rendering current user details */}
        <div>
          <label>You Paid:
            <input
                type="number"
                value={formData.users[0].paidAmount}
                onChange={(e) => handleUserChange(0, 'paidAmount', e.target.value)}
                placeholder="Amount you paid"
            />
          </label>
          {formData.split_type !== 'equal' && (  // Conditionally render based on split type
            <label>{determineOweLabel(formData.split_type)}
              <input
                  type="number"
                  value={formData.users[0].owedAmount}
                  onChange={(e) => handleUserChange(0, 'owedAmount', e.target.value)}
                  placeholder="Enter value"
              />
            </label>
          )}
        </div>
        {/* Rendering other users details */}
        {formData.users.slice(1).map((user, index) => (
          <div key={index + 1}>
            <label>User:
              <select value={user.id} onChange={(e) => handleUserChange(index + 1, 'id', e.target.value)}>
                <option value="">Select Friend</option>
                {friends.map(friend => (
                  <option key={friend.id} value={friend.id}>{friend.first_name}</option>
                ))}
              </select>
            </label>
            <label>Paid Amount:
              <input type="number" value={user.paidAmount} onChange={(e) => handleUserChange(index + 1, 'paidAmount', e.target.value)} placeholder="Amount paid by user" />
            </label>
            {formData.split_type !== 'equal' && (
              <label>{determineOweLabel(formData.split_type)}
                <input type="number" value={user.owedAmount} onChange={(e) => handleUserChange(index + 1, 'owedAmount', e.target.value)} />
              </label>
            )}
            <button type="button" onClick={() => removeUserField(index + 1)}>Remove user</button>
          </div>
        ))}
        <button type="button" onClick={addUserField}>Add User</button>
        {expenseType === 'group' && (
          <label>Group:
            <select name="group_id" value={formData.group_id} onChange={handleChange} required>
              <option value="">Select Group</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    );
  }  
   
};

export default CreateExpenseForm;
