import * as AlertDialog from '@radix-ui/react-alert-dialog';
import React, { useState } from 'react';

const Dialog_entidades_modificar = ({ datos }) => {
  const [formData, setFormData] = useState({ ...datos });

  const entidades = JSON.parse(localStorage.getItem("entidades") || "[]");
  const tipoDeCargaArray = entidades.filter((e) => e.tipo === "TipoDeCarga");
  const zonaDeViajeArray = entidades.filter((e) => e.tipo === "ZonaDeViaje");
  const tipoDeVehiculoArray = entidades.filter((e) => e.tipo === "TipoDeVehiculo");
  const transportistaArray = entidades.filter((e) => e.tipo === "Transportista");
  const vehiculoArray = entidades.filter((e) => e.tipo === "Vehiculo");
  const adicional = entidades.filter((e) => e.tipo === "Adicional");

  const selectParaModificar = (key, value) => {
    const sharedProps = {
      value,
      onChange: e => handleChange(key, e.target.value),
      style: inputStyle,
      disabled: key === 'id'
    };

    const renderOptions = (array, renderLabel) =>
      array.map((e) => (
        <option key={e.datos.id} value={e.datos.id}>
          {renderLabel(e.datos)}
        </option>
      ));

    switch (key) {
      case "id_tipo_carga":
        console.log("tipoDeCargaArray", tipoDeCargaArray);
        
        return (
          <div key={key} style={fieldStyle}>
            <label>{key}</label>
            <select {...sharedProps}>
              <option>Ninguno</option>
              {renderOptions(tipoDeCargaArray, d => key+ " [ID: "+ d.id+" ]")}
            </select>
          </div>
        );
      case "id_zona_viaje":
        return (
          <div key={key} style={fieldStyle}>
            <label>{key}</label>
            <select {...sharedProps}>
              <option>Ninguno</option>
              {renderOptions(zonaDeViajeArray, d => `${d.origen} - ${d.destino}` +" " + key + " [ID: "+d.id+" ]")}
            </select>
          </div>
        );
      case "id_tipo_vehiculo":
        return (
          <div key={key} style={fieldStyle}>
            <label>{key}</label>
            <select {...sharedProps}>
              <option>Ninguno</option>
              {renderOptions(tipoDeVehiculoArray, d => key + " [ID: " +d.id+" ]")}
            </select>
          </div>
        );
      case "id_transportista":
        return (
          <div key={key} style={fieldStyle}>
            <label>{key}</label>
            <select {...sharedProps}>
              <option>Ninguno</option>
              {renderOptions(transportistaArray, d => d.nombre +" "+   key + " [ID: "+d.id+" ]")}
            </select>
          </div>
        );
      case "id_vehiculo":
        return (
          <div key={key} style={fieldStyle}>
            <label>{key}</label>
            <select {...sharedProps}>
              <option>Ninguno</option>
              {renderOptions(vehiculoArray, d => d.patente +" "+ key +" [ID: "+d.id+" ]")}
            </select>
          </div>
        );
      case "id_adicional":
        return (
          <div key={key} style={fieldStyle}>
            <label>{key}</label>
            <select {...sharedProps}>
              <option>Ninguno</option>
              {renderOptions(adicional, d => d.nombre)}
            </select>
          </div>
        );
      default:
        return (
          <div key={key} style={fieldStyle}>
            <label>{key}</label>
            <input {...sharedProps} />
          </div>
        );
    }
  };


  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGuardar = () => {
    const entidades = JSON.parse(localStorage.getItem('entidades')) || [];
    const index = entidades.findIndex(e => e.datos.id === datos.id);
    if (index !== -1) {
      entidades[index].datos = formData;
      localStorage.setItem('entidades', JSON.stringify(entidades));
      alert('Entidad actualizada');
      window.dispatchEvent(new Event("entidades_actualizadas"));
    }
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger style={botonModificarStyle}>
        Modificar entidad
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay style={overlayStyle} />
        <AlertDialog.Content style={dialogStyle}>
          <AlertDialog.Title style={titleStyle}>
            Modificar entidad
          </AlertDialog.Title>

          <form>
            {Object.entries(formData).map(([key, value]) => selectParaModificar(key, value))}
          </form>

          <div style={buttonGroupStyle}>
            <AlertDialog.Cancel asChild>
              <button style={cancelButtonStyle}>Cancelar</button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button onClick={handleGuardar} style={{ ...cancelButtonStyle, backgroundColor: '#4CAF50', color: 'white' }}>
                Guardar
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
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
  zIndex: 1000,
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

const cancelButtonStyle = {
  padding: '8px 14px',
  backgroundColor: '#ccc',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const buttonGroupStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '15px',
};

const botonModificarStyle = {
  backgroundColor: '#4CAF50',
  padding: "10px 20px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "10px",
  color: 'white',
};

export default Dialog_entidades_modificar;
