// src/pages/UserInfo.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserInfo.css';

const UserInfo = () => {
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profile_picture: '',
    phone_number: '',
  });
  const [editMode, setEditMode] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const { first_name, last_name, email, profile_picture, phone_number } = response.data;
        setUserInfo({ first_name, last_name, email, profile_picture, phone_number });
      } catch (error) {
        setError('Failed to fetch user info');
      }
    };
    fetchUserInfo();
  }, []);

  // Toggle edit mode for the field
  const toggleEditMode = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });
  };

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  // Submit updated information
  const handleSubmit = async (field, endpoint = '/me') => {
    try {
      await axios.put(`http://localhost:3000/api/users${endpoint}`, { [field]: userInfo[field] }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toggleEditMode(field);
      alert(`${field} updated successfully.`);
    } catch (error) {
      setError(`Failed to update ${field}`);
    }
  };

  // Render user info fields
  const renderField = (label, field, isPassword = false) => (
    <div className="user-info-field">
      <div className="label">{label}:</div>
      {editMode[field] ? (
        <>
          <input
            type={isPassword ? "password" : "text"}
            name={field}
            value={userInfo[field]}
            onChange={handleChange}
            className="input"
          />
          <button onClick={() => handleSubmit(field, field === 'email' ? '/me/email' : '/me')} className="save-btn">Save</button>
        </>
      ) : (
        <>
          <div className="value">{userInfo[field]}</div>
          {!isPassword && <button onClick={() => toggleEditMode(field)} className="edit-btn">Edit</button>}
        </>
      )}
    </div>
  );

  return (
    <div className="user-info-container">
      {renderField("First Name", "first_name")}
      {renderField("Last Name", "last_name")}
      {renderField("Email", "email")}
      {renderField("Phone Number", "phone_number")}
      <button onClick={() => navigate('/update-password')} className="password-btn">Change Password</button>
      <button onClick={() => {
        const confirm = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirm) navigate('/delete-account');
      }} className="delete-btn">Delete Account</button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default UserInfo;
