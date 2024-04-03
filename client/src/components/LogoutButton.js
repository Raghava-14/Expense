import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    
    // Optionally, if you're using context or Redux for state management,
    // you might want to update the state here to reflect that the user has logged out.
    
    // Redirect to the login page or any public page
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-700 transition duration-150 ease-in-out">
      Logout
    </button>
  );
};

export default LogoutButton;
