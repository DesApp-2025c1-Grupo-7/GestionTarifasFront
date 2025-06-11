import Delete_entidades from "./Delete_entidades/Delete_entidades";
import Dialog_entidades_modificar from "./Dialog_entidades/Dialog_entidades_modificar/Dialog-entidades-modificar";

const Entidad = ({ entidad }) => {
  const { tipo, datos } = entidad;

  return (
    <div>
      <h2>{tipo}</h2>

      <ul>
        {Object.entries(datos).map(([clave, valor]) => (
          <li key={clave}>
            <strong>{clave}:</strong> {valor}
          </li>
        ))}
      </ul>
      <Dialog_entidades_modificar datos={entidad.datos}/>  
      <Delete_entidades entidad={tipo} id={datos.id} />
    </div>
  );
};

export default Entidad;
