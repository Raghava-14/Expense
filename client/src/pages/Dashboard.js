// Dashboard.js
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <NavLink to="/dashboard/insights" className={({ isActive }) => isActive ? "bg-blue-500 p-4" : "p-4"}>Insights</NavLink>
        <NavLink to="/dashboard/expenses" className={({ isActive }) => isActive ? "bg-blue-500 p-4" : "p-4"}>Expenses</NavLink>
        <NavLink to="/dashboard/friends" className={({ isActive }) => isActive ? "bg-blue-500 p-4" : "p-4"}>Friends</NavLink>
        <NavLink to="/dashboard/groups" className={({ isActive }) => isActive ? "bg-blue-500 p-4" : "p-4"}>Groups</NavLink>
        <button onClick={() => {localStorage.removeItem('token'); window.location.href='/';}} className="p-4">Logout</button>
      </div>
      <div className="flex-grow p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
