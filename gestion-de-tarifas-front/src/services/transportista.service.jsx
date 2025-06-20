import axios from 'axios';

const API_URL = 'http://localhost:3001';


export const getTransportista = async () => {
  const res = await axios.get(`${API_URL}/transportista`);
  return res.data;
};