import axios from 'axios';

const API_URL = '/api'; 

export const getTarifas = async () => {
  const response = await axios.get(`${API_URL}/tarifa-costo`);
  return response.data;
};

/**
 * Crea una nueva tarifa de costo.
 * @param {object} tarifaData - El payload con los datos de la tarifa y los adicionales.
 */
export const createTarifa = async (tarifaData) => {
  const response = await axios.post(`${API_URL}/tarifa-costo`, tarifaData);
  return response.data;
};

/**
 * Actualiza una tarifa de costo existente.
 * @param {number} id - El ID de la tarifa a actualizar.
 * @param {object} tarifaData - Los nuevos datos para la tarifa.
 */
export const updateTarifaCosto = async (id, tarifaData) => {
  const response = await axios.put(`${API_URL}/tarifa-costo/${id}`, tarifaData);
  return response.data;
};

/**
 * Realiza un borrado lógico de una tarifa de costo.
 * @param {number} id - El ID de la tarifa a eliminar.
 */
export const deleteTarifa = async (id) => {
  const response = await axios.patch(`${API_URL}/tarifa-costo/${id}/eliminar`);
  return response.data;
};

/*
 * Obtiene los detalles de una tarifa específica por su ID.
 * @param {number} id - El ID de la tarifa a obtener.
 * @returns {Promise<object>} La información de la tarifa.
 */
export const getTarifaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/tarifa-costo/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tarifa with ID ${id}:`, error);
    throw error;
  }
};

/*
Obtiene el historial de versiones de una tarifa específica.
@param {number} id - El ID de la tarifa.
@returns {Promise<Array>} Un array con las versiones históricas.
 */
export const getHistorialDeTarifa = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/tarifa-costo/historial/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching history for tarifa with ID ${id}:`, error);
    throw error;
  }
};

/*
 Obtiene el análisis comparativo de tarifas entre dos fechas (lo voy a usar luego)
 @param {string} fechaInicio - Fecha de inicio en formato YYYY-MM-DD
 @param {string} fechaFin - Fecha de fin en formato YYYY-MM-DD
 */
export const getAnalisisTarifas = async (fechaInicio, fechaFin) => {
  const response = await axios.get(`/api/tarifa-costo/analisis/comparativo`, { 
    params: { fechaInicio, fechaFin } 
  });
  return response.data;
};