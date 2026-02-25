import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PlaceholderDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const { category, subcategory } = useParams();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const dashboardName = subcategory
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} - ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`
    : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#FFD700] py-3 px-6 shadow-md">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-black rounded-full w-10 h-10 flex items-center justify-center">
              <span className="text-lg font-bold text-[#FFD700]">JK</span>
            </div>
            <h1 className="text-xl font-bold text-black">{dashboardName} Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/dashboards')}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100"
            >
              ← Back
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="bg-white hover:bg-gray-100">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard Coming Soon</h2>
            <p className="text-xl text-gray-600 mb-8">Your dashboard will be shown here</p>
            <p className="text-gray-500 mb-8">
              This dashboard is currently under development. We're working hard to bring you comprehensive
              insights and analytics.
            </p>
            <Button onClick={() => navigate('/dashboards')} className="bg-[#FFD700] hover:bg-[#FFC700] text-black">
              Back to Dashboard Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderDashboard;