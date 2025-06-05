import React from 'react'
import './Header.css'
import { RxCountdownTimer } from "react-icons/rx";
import { VscNewFolder } from "react-icons/vsc";
import { TbTruckDelivery } from "react-icons/tb";
<<<<<<< Updated upstream
=======
import FormAlertDialog from '../Dialog_entidades/Dialog-entidades';
import { Link } from 'react-router-dom';

>>>>>>> Stashed changes

const Header = () => {
  return (
    <nav>
        <h1>Logistica <strong>Acme<TbTruckDelivery /></strong></h1>
        <hr></hr>
        <ul>
           
<<<<<<< Updated upstream
            <li><button className='boton'><strong><VscNewFolder /></strong>  Registrar tarifa </button></li>
            <li><button className='boton'><strong><RxCountdownTimer /></strong>  Historico de tarifas </button></li>
=======
            <li><Link to="/registrarTarifa" className='boton'><strong><VscNewFolder /></strong>  Registrar tarifa </Link></li>
            <li><Link to="/historicoTarifas" className='boton'><strong><RxCountdownTimer /></strong>  Historico de tarifas </Link></li>
            <li><FormAlertDialog/></li>
>>>>>>> Stashed changes
        </ul>
      
    </nav>
  )
}

export default Header
