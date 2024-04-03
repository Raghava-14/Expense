import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users/';

const login = async (email, password) => {
  const response = await axios.post(API_URL + 'login', {
    email,
    password,
  });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export default {
  login,
};
