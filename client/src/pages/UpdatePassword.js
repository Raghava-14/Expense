// src/pages/UpdatePassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3000/api/users/me/password', passwords, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('Password updated successfully.');
      navigate('/dashboard/userinfo');
    } catch (error) {
      setError('Failed to update password. Make sure your current password is correct and the new password meets the requirements.');
    }
  };

  return (
    <div className="update-password-form">
      <h2>Update Password</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Current Password</label>
          <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handleChange} required />
        </div>
        <div>
          <label>New Password</label>
          <input type="password" name="newPassword" value={passwords.newPassword} onChange={handleChange} required />
        </div>
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default UpdatePassword;
