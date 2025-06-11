import axios from 'axios';

const API_URL = 'http://localhost:3001';


export const getTarifas = async () => {
  return axios.get(`${API_URL}/tarifa-costo`);
};

export const getZonas = async () => {
  const res = await axios.get(`${API_URL}/zona-de-viaje`);
  return res.data;
};

export const getVehiculos = async () => {
  const res = await axios.get(`${API_URL}/vehiculo`);
  return res.data;
};

export const getTransportista = async () => {
  const res = await axios.get(`${API_URL}/transportista`);
  return res.data;
};


export const postTarifa = async (data) => {
  const res = await axios.post(`${API_URL}/tarifa-costo`, data);
  return res.data;
};