import React from 'react';

export const FleetTabs: React.FC = () => {
  const tabs = [
    { id: 'establishments', label: 'المنشآت' },
    { id: 'drivers', label: 'السائقين' },
    { id: 'vehicles', label: 'المركبات' },
    { id: 'nfc', label: 'بطاقات NFC' },
    { id: 'stations', label: 'محطات الوقود' }
  ];

  return (
    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg dir-rtl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            tab.id === 'establishments' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
