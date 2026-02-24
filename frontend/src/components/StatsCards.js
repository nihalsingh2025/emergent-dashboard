import React from 'react';

const StatsCards = ({ uomInventory, totalRecords }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(uomInventory).map(([uom, quantity]) => (
        <div
          key={uom}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
          data-testid={`stats-card-${uom}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">Inventory ({uom})</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{quantity.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500" data-testid="stats-card-total">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase">Total Records</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalRecords}</p>
          </div>
          <div className="bg-green-100 rounded-full p-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;