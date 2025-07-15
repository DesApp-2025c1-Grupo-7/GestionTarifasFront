import axios from 'axios';

const API_URL = '/api';


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

// nueva función para obtener el reporte de tarifas por transportista
export const getTransportistaReport = async () => {
  const res = await axios.get(`${API_URL}/transportista/reporte-tarifas`);
  return res.data;
};