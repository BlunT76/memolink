import axios from 'axios';
import api from './constant';

const apiSignIn = async (username, password) => {
  const data = JSON.stringify({
    username,
    password,
  });

  const request = axios.create({
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
  const response = await request.post(`${api}login`, data)
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

export default apiSignIn;
