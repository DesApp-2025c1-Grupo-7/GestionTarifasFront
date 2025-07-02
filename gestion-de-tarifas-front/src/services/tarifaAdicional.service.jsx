import axios from 'axios';

const API_URL = 'http://localhost:3001';

/**
 * Obtiene todos los vínculos Tarifa-Adicional.
 * NOTA: Para optimizar, lo ideal sería que el backend tuviera un endpoint 
 * que devuelva solo los adicionales para una tarifa específica.
 * Por ahora, traemos todos y filtramos en el frontend.
 * @returns {Promise<Array>} - Una promesa que resuelve a un array de todos los vínculos.
 */
export const getTodosLosTarifaAdicionales = async () => {
  try {
    const response = await axios.get(`${API_URL}/tarifa-adicional`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los vínculos tarifa-adicional:', error);
    return [];
  }
};


/**
 * Crea un nuevo vínculo entre una tarifa y un adicional.
 * @param {object} dto - El objeto con { tarifaId, adicionalId }.
 * @returns {Promise<object>} - El nuevo vínculo creado.
 */
export const createTarifaAdicional = async (dto) => {
  const response = await axios.post(`${API_URL}/tarifa-adicional`, dto);
  return response.data;
};

/**
 * Elimina un vínculo existente entre una tarifa y un adicional.
 * @param {number} id - El ID del registro en la tabla TarifaAdicional.
 * @returns {Promise<object>} - La respuesta de la API.
 */
export const deleteTarifaAdicional = async (id) => {
  const response = await axios.delete(`${API_URL}/tarifa-adicional/${id}`);
  return response.data;
};
