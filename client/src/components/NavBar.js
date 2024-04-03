import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton'; // Make sure the path is correct based on your file structure

const NavBar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        {/* Add more links as needed */}
        <li>
          <LogoutButton />
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
