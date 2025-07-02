import axios from 'axios';

// La URL base de tu backend. Es consistente con tus otros servicios.
const API_URL = 'http://localhost:3001'; 

/**
 * Obtiene todas las tarifas de costo desde el backend.
 */
export const getTarifas = async () => {
  const response = await axios.get(`${API_URL}/tarifa-costo`);
  return response.data;
};

/**
 * Crea una nueva tarifa de costo.
 * Esta es la función clave que soluciona el error 404.
 * @param {object} tarifaData - El payload con los datos de la tarifa y los adicionales.
 */
export const createTarifa = async (tarifaData) => {
  // Apunta a POST /tarifa-costo, que es la ruta correcta en tu controller.
  const response = await axios.post(`${API_URL}/tarifa-costo`, tarifaData);
  return response.data;
};

/**
 * Actualiza una tarifa de costo existente.
 * @param {number} id - El ID de la tarifa a actualizar.
 * @param {object} tarifaData - Los nuevos datos para la tarifa.
 */
export const updateTarifaCosto = async (id, tarifaData) => {
  // Apunta a PUT /tarifa-costo/:id
  const response = await axios.put(`${API_URL}/tarifa-costo/${id}`, tarifaData);
  return response.data;
};

/**
 * Realiza un borrado lógico de una tarifa de costo.
 * @param {number} id - El ID de la tarifa a eliminar.
 */
export const deleteTarifa = async (id) => {
  // Apunta a PATCH /tarifa-costo/:id/eliminar
  const response = await axios.patch(`${API_URL}/tarifa-costo/${id}/eliminar`);
  return response.data;
};