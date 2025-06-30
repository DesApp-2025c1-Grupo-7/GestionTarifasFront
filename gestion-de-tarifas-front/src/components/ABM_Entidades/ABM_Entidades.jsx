import React, { useState } from 'react';
import { Package, Truck, MapPin, Building, Plus, DollarSign } from 'lucide-react';
import TiposCarga from './Tipo_De_Carga/Carga';
import TiposVehiculo from './Tipo_De_Vehiculo/Vehiculo';
import ZonasViaje from './Zona_De_Viaje/ZonaViaje';
import Transportistas from './Transportista/Transportista';
import Adicionales from './Adicionales/Adicionales';
import RegistroTarifas from './Registro_De_Tarifa/RegistroTarifas';
import logo from '../../assets/logo.png';

const ABMEntidades = () => {
  const [activeTab, setActiveTab] = useState('cargoTypes');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Configuración de pestañas
  const tabs = [
    { id: 'cargoTypes', label: 'Tipos de Carga', icon: Package, color: 'blue', component: TiposCarga },
    { id: 'vehicleTypes', label: 'Tipos de Vehículo', icon: Truck, color: 'green', component: TiposVehiculo },
    { id: 'zones', label: 'Zonas de Viaje', icon: MapPin, color: 'purple', component: ZonasViaje },
    { id: 'transporters', label: 'Transportistas', icon: Building, color: 'orange', component: Transportistas },
    { id: 'additionals', label: 'Adicionales', icon: Plus, color: 'indigo', component: Adicionales },
    { id: 'rates', label: 'Tarifas', icon: DollarSign, color: 'teal', component: RegistroTarifas }
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentComponent = currentTab.component;

  const tabsColorActive = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-700';
      case 'green':
        return 'bg-green-700';
      case 'purple':
        return 'bg-purple-700';
      case 'orange':
        return 'bg-orange-500';
      case 'indigo':
        return 'bg-indigo-500';
      case 'emerald':
        return 'bg-emerald-500';
      case 'teal':        
        return 'bg-teal-500';
      default:
        return 'bg-gray-500';
    }

  }

  return (
    <div className="min-h-screen bg-[#242423]">
      <div className="max-w-screen mx-auto shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-center bg-[#444240] p-2">
          <img
            src={logo}
            alt="Logo"
            className="h-20 object-contain"
          />
        </div>

        {/* Tabs */}
        <div className="bg-[#444240] p-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const tabColor = tab.color;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === tab.id
                    ? `${tabsColorActive(tabColor)} text-white shadow-lg`
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Component Content */}
        <div className="p-8">
          <CurrentComponent
            showNotification={showNotification}
            tabColor={currentTab.color}
          />
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-5 right-5 px-6 py-4 rounded-lg text-white font-semibold shadow-lg z-50 transition-all ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ABMEntidades;