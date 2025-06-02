import * as AlertDialog from '@radix-ui/react-alert-dialog';
import React, { useState } from 'react';

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
            </select>
          </div>

          {entidad === "TipoDeCarga" && (
            <form onSubmit={handleSubmit}>
    
              <div style={fieldStyle}>
                <label htmlFor="categoria">Categoría:</label>
                <input type="text" name="categoria" required style={inputStyle} />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="requisitos_especiales">Requisitos Especiales:</label>
                <input type="text" name="requisitos_especiales" style={inputStyle} />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="peso_total">Peso Total:</label>
                <input type="number" step="any" name="peso_total" required style={inputStyle} />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="volumen_total">Volumen Total:</label>
                <input type="number" step="any" name="volumen_total" required style={inputStyle} />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="valor_base">Valor Base:</label>
                <input type="number" step="any" name="valor_base" required style={inputStyle} />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="es_peligrosa">¿Es peligrosa?</label>
                <input type="checkbox" name="es_peligrosa" style={{ marginLeft: "10px" }} />
              </div>

              <div style={buttonGroupStyle}>
                <AlertDialog.Cancel asChild>
                  <button type="button" style={cancelButtonStyle}>Cancelar</button>
                </AlertDialog.Cancel>
                <button type="submit" style={submitButtonStyle}>Crear</button>
              </div>
            </form>
          )}

          {entidad === "ZonaDeViaje" && (
            <form onSubmit={handleSubmit}>

                <div style={fieldStyle}>
                <label htmlFor="origen">Origen:</label>
                <input type="text" name="origen" required style={inputStyle} />
                </div>

                <div style={fieldStyle}>
                <label htmlFor="destino">Destino:</label>
                <input type="text" name="destino" required style={inputStyle} />
                </div>

                <div style={fieldStyle}>
                <label htmlFor="distancia">Distancia (km):</label>
                <input type="number" step="any" name="distancia" required style={inputStyle} />
                </div>

                <div style={buttonGroupStyle}>
                <AlertDialog.Cancel asChild>
                    <button type="button" style={cancelButtonStyle}>Cancelar</button>
                </AlertDialog.Cancel>
                <button type="submit" style={submitButtonStyle}>Crear</button>
                </div>
            </form>
            )}
            {entidad === "TipoDeVehiculo" && (
            <form onSubmit={handleSubmit}>

                <div style={fieldStyle}>
                <label htmlFor="origen">Origen:</label>
                <input type="text" name="origen" required style={inputStyle} />
                </div>

                <div style={fieldStyle}>
                <label htmlFor="destino">Destino:</label>
                <input type="text" name="destino" required style={inputStyle} />
                </div>

                <div style={fieldStyle}>
                <label htmlFor="distancia">Distancia (km):</label>
                <input type="number" step="any" name="distancia" required style={inputStyle} />
                </div>

                <div style={buttonGroupStyle}>
                <AlertDialog.Cancel asChild>
                    <button type="button" style={cancelButtonStyle}>Cancelar</button>
                </AlertDialog.Cancel>
                <button type="submit" style={submitButtonStyle}>Crear</button>
                </div>
            </form>
            )}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

// Estilos
const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

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

const fieldStyle = {
  marginBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const buttonGroupStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '15px',
};

const cancelButtonStyle = {
  padding: '8px 14px',
  backgroundColor: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const submitButtonStyle = {
  padding: '8px 14px',
  backgroundColor: '#4caf50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};
