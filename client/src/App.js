import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import SignUpPage from './pages/SignUp';
import logo from './assets/complete_logo.png'; // Ensure this path is correct

const Header = () => {
  const location = useLocation(); // To determine the current route
  const showLoginButton = location.pathname === '/'; // Show on Home page only

  return (
    <header className="flex justify-between items-center bg-white shadow px-4" style={{ height: '1in', padding: '0.4in' }}>
      <Link to="/" className="flex items-center">
        <img src={logo} alt="Logo" style={{ height: '1in' }} className="ml-12" /> {/* Add some right margin to the logo */}
      </Link>
      {showLoginButton && (
        <Link to="/login" className="ml-auto"> {/* Align the button to the right */}
          <button className="cursor-pointer transition-all bg-gray-700 text-white px-6 py-2 rounded-lg border-green-400 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] hover:shadow-xl hover:shadow-green-300 shadow-green-300 active:shadow-none" >
            Login
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
        <main className="container mx-auto px-4 py-6" style={{ paddingTop: '20px' }}> {/* Adjust the top padding to match the header */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            {/* Define other routes */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
