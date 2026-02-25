import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DashboardSelection = ({ onLogout }) => {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState({});

  const dashboards = [
    {
      id: 'inventory',
      name: 'Inventory Dashboard',
      icon: '📦',
      path: '/dashboard/inventory',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'production',
      name: 'Production',
      icon: '🏭',
      color: 'from-green-500 to-green-600',
      subcategories: [
        { id: 'mixer', name: 'Mixer', path: '/dashboard/production/mixer' },
        { id: 'trc', name: 'TRC', path: '/dashboard/production/trc' },
        { id: 'duplex', name: 'Duplex', path: '/dashboard/production/duplex' },
        { id: 'triplex', name: 'Triplex', path: '/dashboard/production/triplex' },
        { id: 'curing', name: 'Curing', path: '/dashboard/production/curing' },
      ],
    },
    {
      id: 'technical',
      name: 'Technical',
      icon: '⚙️',
      color: 'from-purple-500 to-purple-600',
      subcategories: [
        { id: 'tech1', name: 'Technical 1', path: '/dashboard/technical/tech1' },
        { id: 'tech2', name: 'Technical 2', path: '/dashboard/technical/tech2' },
        { id: 'tech3', name: 'Technical 3', path: '/dashboard/technical/tech3' },
      ],
    },
    {
      id: 'quality',
      name: 'Quality',
      icon: '✓',
      color: 'from-red-500 to-red-600',
      subcategories: [
        { id: 'qual1', name: 'Quality 1', path: '/dashboard/quality/qual1' },
        { id: 'qual2', name: 'Quality 2', path: '/dashboard/quality/qual2' },
        { id: 'qual3', name: 'Quality 3', path: '/dashboard/quality/qual3' },
      ],
    },
    {
      id: 'utility',
      name: 'Utility',
      icon: '🔧',
      color: 'from-orange-500 to-orange-600',
      subcategories: [
        { id: 'util1', name: 'Utility 1', path: '/dashboard/utility/util1' },
        { id: 'util2', name: 'Utility 2', path: '/dashboard/utility/util2' },
        { id: 'util3', name: 'Utility 3', path: '/dashboard/utility/util3' },
      ],
    },
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#FFD700] py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-black rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-xl font-bold text-[#FFD700]">JK</span>
            </div>
            <h1 className="text-2xl font-bold text-black">JK Tyre Dashboards</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white hover:bg-gray-100"
            data-testid="logout-button"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Dashboard</h2>
          <p className="text-gray-600">Choose a dashboard to view your data and insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <div key={dashboard.id}>
              {dashboard.subcategories ? (
                /* Dashboard with subcategories */
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(dashboard.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    data-testid={`category-${dashboard.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-lg bg-gradient-to-br ${dashboard.color} flex items-center justify-center text-3xl`}
                      >
                        {dashboard.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-900">{dashboard.name}</h3>
                        <p className="text-sm text-gray-500">
                          {dashboard.subcategories.length} dashboards
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${
                        expandedCategories[dashboard.id] ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedCategories[dashboard.id] && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-2">
                        {dashboard.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => navigate(sub.path)}
                            className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-colors"
                            data-testid={`subcategory-${sub.id}`}
                          >
                            <span className="font-medium text-gray-900">{sub.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Direct dashboard link */
                <button
                  onClick={() => navigate(dashboard.path)}
                  className="w-full bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                  data-testid={`dashboard-${dashboard.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-lg bg-gradient-to-br ${dashboard.color} flex items-center justify-center text-3xl`}
                    >
                      {dashboard.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">{dashboard.name}</h3>
                      <p className="text-sm text-gray-500">View dashboard →</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSelection;