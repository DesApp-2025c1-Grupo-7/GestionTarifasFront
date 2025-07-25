import axios from 'axios';

const API_URL = '/api';

export const getAdicionales = async () => {
  const res = await axios.get(`${API_URL}/adicional`);
  return res.data;
};

export const createAdicional = async (adicional) => {
  const res = await axios.post(`${API_URL}/adicional`, adicional);
  return res.data;
};

export const updateAdicional = async (id, adicional) => {
  const res = await axios.patch(`${API_URL}/adicional/${id}`, adicional);
  return res.data;
};

export const deleteAdicional = async (id) => {
  const res = await axios.delete(`${API_URL}/adicional/${id}`);
  return res.data;
};

export const getAdicionalById = async (id) => {
  const res = await axios.get(`${API_URL}/adicional/${id}`);
  return res.data;
};

export const getAdicionalesReport = async () => {
  
  const res = await axios.get(`${API_URL}/adicional/reporte`);
  
  return res.data; 
};

/**
 * Obtiene la lista de tarifas que usan un adicional específico.
 * @param {number} idAdicional - El ID del adicional.
 */

export const getTarifasForAdicional = async (idAdicional) => {
  try {
    const response = await axios.get(`${API_URL}/adicional/${idAdicional}/tarifas`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener las tarifas para el adicional ${idAdicional}:`, error);
    return [];
  }
};
