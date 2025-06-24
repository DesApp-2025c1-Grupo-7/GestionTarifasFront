import axios from 'axios';

const API_URL = 'http://localhost:3001';


export const getTransportista = async () => {
  const res = await axios.get(`${API_URL}/transportista`);
  return res.data;
};

export const createTransportista = async (data) => {
  const res = await axios.post(`${API_URL}/transportista`, data);
  return res.data;
};

export const updateTransportista = async (id, data) => {
  const res = await axios.put(`${API_URL}/transportista/${id}`, data);
  return res.data;
};

export const deleteTransportista = async (id) => {
  const res = await axios.patch(`${API_URL}/transportista/${id}/eliminar`);
  return res.data;
};