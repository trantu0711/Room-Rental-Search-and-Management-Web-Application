import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:7072/api/', // Địa chỉ gốc
  timeout: 10000, // Chờ 10 giây
  
});

export default API;