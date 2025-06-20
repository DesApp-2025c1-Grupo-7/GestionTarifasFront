import axios from 'axios';

const API_URL = 'http://localhost:3001';


export const getTarifas = async () => {
  return axios.get(`${API_URL}/tarifa-costo`);
};

export const postTarifa = async (data) => {
  const res = await axios.post(`${API_URL}/tarifa-costo`, data);
  return res.data;
};

