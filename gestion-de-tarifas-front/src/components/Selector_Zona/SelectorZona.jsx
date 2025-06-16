import { useState } from 'react';

const SelectorZona = ({ zonas, zona, setZona, filtroZona, setFiltroZona }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaZona, setNuevaZona] = useState({
    origen: '',
    destino: '',
    distancia: '',
    costoKilometro: ''
  });

  const handleCrearZona = async () => {
    // Validaciones mínimas
    if (!nuevaZona.origen || !nuevaZona.destino || !nuevaZona.distancia || !nuevaZona.costoKilometro) return;

    try {
      const res = await fetch('http://localhost:3001/zona-de-viaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevaZona,
          distancia: parseFloat(nuevaZona.distancia),
          costoKilometro: parseFloat(nuevaZona.costoKilometro)
        })
      });

      if (res.ok) {
        const nueva = await res.json();
        // Actualizá el selector agregando la nueva zona a la lista
        alert("Zona creada correctamente");
        setMostrarFormulario(false);
        setNuevaZona({ origen: '', destino: '', distancia: '', costoKilometro: '' });
      } else {
        alert("Error al crear zona");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al crear zona");
    }
  };

  return (
    <div className="form-group-zona">
      <div>
        <label>Filtrar zona </label>
        <input 
          type="text" 
          placeholder="Buscar por origen o destino"
          value={filtroZona}
          onChange={e => setFiltroZona(e.target.value)}
        />
      </div>
   
      <label>Seleccionar Zona</label>
      
      <div>
        <select value={zona} onChange={e => setZona(Number(e.target.value))} required>
          <option value="">Seleccione zona</option>
          {zonas
            .filter(z => `${z.origen} ${z.destino}`.toLowerCase().includes(filtroZona.toLowerCase()))
            .map(z => (
              <option key={z.id} value={z.id}>
                {z.origen} → {z.destino} - ${z.distancia * z.costoKilometro}
              </option>
            ))
          }
        </select>
      </div>

      <button type="button" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
        {mostrarFormulario ? "Cancelar" : "Crear nueva zona"}
      </button>

      {mostrarFormulario && (
        <div className="nueva-zona-form">
          <input
            type="text"
            placeholder="Origen"
            value={nuevaZona.origen}
            onChange={e => setNuevaZona({ ...nuevaZona, origen: e.target.value })}
          />
          <input
            type="text"
            placeholder="Destino"
            value={nuevaZona.destino}
            onChange={e => setNuevaZona({ ...nuevaZona, destino: e.target.value })}
          />
          <input
            type="number"
            placeholder="Distancia (km)"
            value={nuevaZona.distancia}
            onChange={e => setNuevaZona({ ...nuevaZona, distancia: e.target.value })}
          />
          <input
            type="number"
            placeholder="Costo por km"
            value={nuevaZona.costoKilometro}
            onChange={e => setNuevaZona({ ...nuevaZona, costoKilometro: e.target.value })}
          />
          <button type="button" onClick={handleCrearZona}>Guardar zona</button>
        </div>
      )}
    </div>
  );
};

export default SelectorZona;
