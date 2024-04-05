import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prevCredentials => ({ ...prevCredentials, [name]: value }));
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('Attempting to log in with:', credentials);

    try {
      const response = await axios.post('http://localhost:3000/api/users/login', credentials);
      console.log('Login response:', response);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <input type="email" name="email" className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150" placeholder="Email address" onChange={handleChange} required />
          <input type="password" name="password" className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150" placeholder="Password" onChange={handleChange} required />
          <div className="flex items-center justify-between flex-wrap">
            <label htmlFor="remember-me" className="text-sm text-gray-900 cursor-pointer">
              <input type="checkbox" id="remember-me" className="mr-2" onChange={handleRememberMeChange} checked={rememberMe} />
              Remember me
            </label>
            <button className="text-sm text-blue-500 hover:underline mb-0.5 focus:outline-none" onClick={() => {/* handle forgot password */}}>
              Forgot password?</button>
          </div>
          <p className="text-gray-900 mt-4"> Don't have an account? <Link to="/register" className="text-sm text-blue-500 hover:underline">Signup</Link></p>
          <button type="submit" className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150">Login</button>
        </form>
      </div>
    </div>
  );
} 

export default Login;
