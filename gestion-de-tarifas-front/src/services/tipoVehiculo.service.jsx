import axios from 'axios';

const API_URL = 'http://localhost:3001';



export const getVehiculos = async () => {
  const res = await axios.get(`${API_URL}/tipo-vehiculo`);
  return res.data;
};
