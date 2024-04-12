import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import SignUpPage from './pages/SignUp';
import logo from './assets/complete_logo.png';
import Dashboard from './pages/Dashboard';
import UserInfo from './pages/UserInfo';
import UpdatePassword from './pages/UpdatePassword';
import Insights from './pages/Insights';
import Expenses from './pages/Expenses';
import ExpenseDetails from './pages/ExpenseDetails';
import Friends from './pages/Friends';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';

const Header = () => {
  const location = useLocation(); // To determine the current route
  const showLoginButton = location.pathname === '/' && !isAuthenticated(); // Show on Login button if user is not authenticated
  const showUserInfoButton = location.pathname.startsWith('/dashboard') && location.pathname !== '/dashboard/userinfo';//Show Dashboard if user is authenticated
  const showDashboardButton = location.pathname === '/' && isAuthenticated(); //Show Dashboard if user is authenticated

  return (
    <header className="flex justify-between items-center bg-white shadow px-4" style={{ height: '1in', padding: '0.4in' }}>
      <Link to="/" className="flex items-center">
        <img src={logo} alt="Logo" style={{ height: '1in' }} className="ml-1" /> {/* Add some right margin to the logo */}
      </Link>
      {showLoginButton && (
        <Link to="/login" className="ml-auto"> {/* Align the button to the right */}
          <button className="cursor-pointer transition-all bg-gray-700 text-white px-6 py-2 rounded-lg border-green-400 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] hover:shadow-xl hover:shadow-green-300 shadow-green-300 active:shadow-none" >
            Login
          </button>
        </Link>
      )}
      {showDashboardButton && (
        <Link to="/dashboard" className="ml-auto"> {/* Align the button to the right */}
          <button className="cursor-pointer transition-all bg-gray-700 text-white px-6 py-2 rounded-lg border-green-400 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] hover:shadow-xl hover:shadow-green-300 shadow-green-300 active:shadow-none" >
            Dashboard
          </button>
        </Link>
      )}
      {showUserInfoButton && (
        <Link to="/dashboard/userinfo" className="ml-auto"> {/* Align the button to the right */}
          <button className="cursor-pointer transition-all bg-gray-700 text-white px-6 py-2 rounded-lg border-green-400 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] hover:shadow-xl hover:shadow-green-300 shadow-green-300 active:shadow-none" >
            User Info
          </button>
        </Link>
      )}
    </header>

  );
};


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/dashboard/" element={<Dashboard />}>
            <Route path="userinfo" element={<UserInfo />} />
            <Route path="insights" element={<Insights />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="expenses/:expenseId" element={<ExpenseDetails />} />
            <Route path="friends" element={<Friends />} />
            <Route path="groups" element={<Groups />} />
            <Route path="groups/:groupId" element={<GroupDetails />} />
            {/* Redirect to Insights by default if just "/dashboard" is accessed */}
            <Route index element={<Insights />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
