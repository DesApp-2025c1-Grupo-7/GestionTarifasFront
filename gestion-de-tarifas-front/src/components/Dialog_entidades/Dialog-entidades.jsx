import * as AlertDialog from '@radix-ui/react-alert-dialog';
import React, { useState } from 'react';
import Entidad from './Entidad';

export default function FormAlertDialog() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const datos = {};
    for (let pair of data.entries()) {
      datos[pair[0]] = pair[1];
    }
    alert(`Formulario enviado:\n${JSON.stringify(datos, null, 2)}`);
  };

  const [entidad, setEntidad] = useState("");

  const setNewEntidad = (valor) => {
    setEntidad(valor);
  };
  const calcularCostoKm = (distancia) => {
  const tarifaBase = 100; // por ejemplo
  return (tarifaBase / distancia).toFixed(2);
};

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className='boton'>
        Crear entidad
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay style={overlayStyle} />
        <AlertDialog.Content style={dialogStyle}>
          <AlertDialog.Title style={titleStyle}>
            Crear una entidad
          </AlertDialog.Title>

          <div style={fieldStyle}>
            <label htmlFor="opcion">Selecciona una entidad:</label>
            <select
              name="opcion"
              required
              style={inputStyle}
              value={entidad}
              onChange={(e) => setNewEntidad(e.target.value)}
            >
              <option value="">-- Seleccionar --</option>
              <option value="TipoDeCarga">Tipo de carga</option>
              <option value="ZonaDeViaje">Zona de viaje</option>
              <option value="TipoDeVehiculo">Tipo de vehiculo</option>
              <option value="Vehiculo">Vehiculo</option>
              <option value="Transportista">Transportista</option>
              <option value="TarifaDeCosto">Tarifa Costo</option>
              <option value="Adicional">Adicional</option>
            </select>
          </div>

          <Entidad entidad={entidad} handleSubmit={handleSubmit}/>


        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
//Estilos
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
};
const dialogStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '40rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  zIndex:1000 ,
};
const titleStyle = {
  fontSize: '18px',
  marginBottom: '15px',
};
const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};
const fieldStyle = {
  marginBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
};
