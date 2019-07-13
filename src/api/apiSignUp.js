import axios from 'axios';
import api from './constant';

// eslint-disable-next-line camelcase
const apiSignUp = async (username, email, password_1, password_2) => {
  const data = JSON.stringify({
    username,
    email,
    password_1,
    password_2,
  });

  const request = axios.create({
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
  const response = await request.post(`${api}register`, data)
  .catch((error) => {
    if (!error.status) {
      // network error
      return {data: {code: 523, status: "error", message: "Server Is Unreachable. Check your Connexion or Server is Down"}}
    }
  });
  
  if (await response) {
    return response;
  }
  return null;
};

export default apiSignUp;
