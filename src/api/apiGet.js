import axios from 'axios';
import api from './constant';

const myHeaders = new Headers();

const myInit = {
  method: 'GET',
  headers: myHeaders,
  mode: 'cors',
  cache: 'default',
};

const apiGet = async (jwt, table, id = '') => {
  const request = axios.create({
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      authorization: `Bearer ${jwt}`,
    },
  });
  const response = await request.get(`${api}${table}/${id}`, myInit)
  .catch((error) => {
    if (!error.status) {
      // network error
      return {data: {code: 523, status: "error", message: "Server Is Unreachable. Check your Connexion or Server is Down"}}
    }
  });
  if (response) {
    return response;
  }
  return null;
};

export default apiGet;
