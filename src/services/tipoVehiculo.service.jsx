import axios from 'axios';

const API_URL = '/api';



export const getVehiculos = async () => {
  const res = await axios.get(`${API_URL}/tipo-vehiculo`);
  return res.data;
};

export const createVehiculo = async (data) => {
  const res = await axios.post(`${API_URL}/tipo-vehiculo`, data);
  return res.data;
};

export const updateVehiculo = async (id, data) => {
  const res = await axios.put(`${API_URL}/tipo-vehiculo/${id}`, data);
  return res.data;
};

export const deleteVehiculo = async (id) => {
  const res = await axios.patch(`${API_URL}/tipo-vehiculo/${id}/eliminar`);
  return res.data;
};