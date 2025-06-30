import axios from 'axios';

const API_URL = 'http://localhost:3001';


export const getTarifas = async () => {
  return axios.get(`${API_URL}/tarifa-costo`);
};

export const createTarifa = async (data) => {
  const res = await axios.post(`${API_URL}/tarifa-costo`, data);
  return res.data;
};


export const updateTarifaCosto = async (id, tarifa) => {
  const res = await axios.put(`${API_URL}/tarifa-costo/${id}`, tarifa);
  return res.data;
};

export const deleteTarifa= async (id) => {
  const res = await axios.patch(`${API_URL}/tarifa-costo/${id}/eliminar`);
  return res.data;
};