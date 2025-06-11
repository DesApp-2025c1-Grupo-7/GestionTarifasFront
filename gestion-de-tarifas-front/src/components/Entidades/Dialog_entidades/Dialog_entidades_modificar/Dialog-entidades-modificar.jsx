import * as AlertDialog from '@radix-ui/react-alert-dialog';
import React, { useState } from 'react';

const Dialog_entidades_modificar = ({ datos }) => {
  const [formData, setFormData] = useState({ ...datos });

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
      <AlertDialog.Trigger className='boton'>
        Modificar entidad
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay style={overlayStyle} />
        <AlertDialog.Content style={dialogStyle}>
          <AlertDialog.Title style={titleStyle}>
            Modificar entidad
          </AlertDialog.Title>

          <form>
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} style={fieldStyle}>
                <label>{key}</label>
                <input
                  type="text"
                  value={value}
                  onChange={e => handleChange(key, e.target.value)}
                  style={inputStyle}
                  disabled={key === 'id'} // id no debe modificarse
                />
              </div>
            ))}
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

export default Dialog_entidades_modificar;
