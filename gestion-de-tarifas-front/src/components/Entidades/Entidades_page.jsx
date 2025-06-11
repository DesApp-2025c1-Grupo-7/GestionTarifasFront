import { useState, useEffect } from 'react';
import FormAlertDialog from './Dialog_entidades/Dialog-entidades';
import Entidad from './Entidad';

const Entidades_page = () => {
    const [entidades, setEntidades] = useState(JSON.parse(localStorage.getItem("entidades")) || []);

    useEffect(() => {
        const handleStorageChange = () => {
            const nuevasEntidades = JSON.parse(localStorage.getItem("entidades"));
            setEntidades(nuevasEntidades || []);
        };

        window.addEventListener("entidades_actualizadas", handleStorageChange);
        return () => {
            window.removeEventListener("entidades_actualizadas", handleStorageChange);
        };
    }, []);

    return (
        <>
            {entidades.map((entidad, index) => (
                <Entidad key={index} entidad={entidad}/>
            ))}
            <FormAlertDialog />
        </>
    );
};

export default Entidades_page;
