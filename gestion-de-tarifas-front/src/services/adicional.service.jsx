import axios from 'axios';

const API_URL = 'http://localhost:3001';

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
/*
export const getAdicionalesReport = async () => {
  const res = await fetch(`${API_URL}/adicional/reporte`);
  const json = await res.json();
  return json.data
};
*/
export const getAdicionalesReport = async () => {
  // Usamos axios para ser consistentes con el resto del archivo.
  const res = await axios.get(`${API_URL}/adicional/reporte`);
  // Axios devuelve los datos directamente en la propiedad 'data' de la respuesta.
  return res.data; // <-- ESTA ES LA FORMA CORRECTA CON AXIOS
};
