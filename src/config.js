import axios from 'axios';
const token = localStorage.getItem('access');

const axiosInstance = axios.create({
  // baseURL: `https://1c52587ba365.ngrok-free.app`,
  baseURL: `http://127.0.0.1:8000/`,
  //baseURL:`https://8cb5262abe4d.ngrok-free.app/`
});

axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

export default axiosInstance;
