import axios from 'axios';

const API_URL = 'http://localhost:3001';



export const getCargas = async () => {
  const res = await axios.get(`${API_URL}/tipo-carga/all`);
  return res.data;
};

export const createCarga = async (carga) => {
  const res = await axios.post(`${API_URL}/tipo-carga`, carga);
  return res.data;
};

export const updateCarga = async (id, carga) => {
  const res = await axios.put(`${API_URL}/tipo-carga/${id}`, carga);
  return res.data;
};

export const deleteCarga= async (id) => {
  const res = await axios.patch(`${API_URL}/tipo-carga/${id}/delete`);
  return res.data;
};

export const getCargaById = async (id) => {
  const res = await axios.get(`${API_URL}/tipo-carga/${id}`);
  return res.data;
};