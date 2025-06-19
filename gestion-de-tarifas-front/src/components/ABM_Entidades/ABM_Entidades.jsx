import React, { useState } from 'react';
import { Package, Truck, MapPin, Building, Plus, DollarSign } from 'lucide-react';
import TiposCarga from './Tipo_De_Carga/Carga';
import TiposVehiculo from './Tipo_De_Vehiculo/Vehiculo';
import ZonasViaje from './Zona_De_Viaje/ZonaViaje';
import Transportistas from './Transportista/Transportista';

const ABMEntidades = () => {
  const [activeTab, setActiveTab] = useState('cargoTypes');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Configuración de pestañas
  const tabs = [
    { id: 'cargoTypes', label: 'Tipos de Carga', icon: Package, color: 'blue', component: TiposCarga },
    { id: 'vehicleTypes', label: 'Tipos de Vehículo', icon: Truck, color: 'green', component: TiposVehiculo },
    { id: 'zones', label: 'Zonas de Viaje', icon: MapPin, color: 'purple', component: ZonasViaje },
    { id: 'transporters', label: 'Transportistas', icon: Building, color: 'orange', component: Transportistas },
    { id: 'additionals', label: 'Adicionales', icon: Plus, color: 'indigo' },
    { id: 'rates', label: 'Tarifas', icon: DollarSign, color: 'emerald' }
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentComponent = currentTab.component;

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        

        {/* Tabs */}
        <div className="bg-gray-100 p-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-500 text-white shadow-lg`
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
        <div className={`fixed top-5 right-5 px-6 py-4 rounded-lg text-white font-semibold shadow-lg z-50 transition-all ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ABMEntidades;