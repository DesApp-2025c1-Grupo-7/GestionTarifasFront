import axios from 'axios';

const API_URL = '/api';



export const getZonas = async () => {
  const res = await axios.get(`${API_URL}/zona-de-viaje`);
  return res.data;
};

export const createZona = async (zona) => {
  const res = await axios.post(`${API_URL}/zona-de-viaje`, zona);
  return res.data;
};

export const updateZona = async (id, zona) => {
  const res = await axios.put(`${API_URL}/zona-de-viaje/${id}`, zona);
  return res.data;
};

export const deleteZona = async (id) => {
  const res = await axios.patch(`${API_URL}/zona-de-viaje/${id}/eliminar`);
  return res.data;
};