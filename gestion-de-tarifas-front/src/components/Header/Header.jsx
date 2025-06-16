import React, { useState } from 'react';
import './Header.css';
import { RxCountdownTimer } from "react-icons/rx";
import { VscNewFolder } from "react-icons/vsc";
import { TbTruckDelivery } from "react-icons/tb";
import { Link } from 'react-router-dom';

const Header = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  return (
    <nav>
      <div className="nav-top">
        <h1>Logística <strong>Acme<TbTruckDelivery /></strong></h1>
        <button 
          className="navbar-toggler" 
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      </div>
      <ul className={menuAbierto ? "visible" : "oculto"}>
        <li><Link to="/registrarTarifa" className='boton'><strong><VscNewFolder /></strong> Registrar tarifa</Link></li>
        <li><Link to="/historicoTarifas" className='boton'><strong><RxCountdownTimer /></strong> Histórico de tarifas</Link></li>
        <li><Link className='boton'>Gestión de Servicios</Link></li>
      </ul>
    </nav>
  );
}

export default Header;
