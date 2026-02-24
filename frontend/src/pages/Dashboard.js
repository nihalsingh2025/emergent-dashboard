import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import FilterPanel from '@/components/FilterPanel';
import StatsCards from '@/components/StatsCards';
import MHETable from '@/components/MHETable';
import ItemCodeTable from '@/components/ItemCodeTable';
import ItemCodeUOMTable from '@/components/ItemCodeUOMTable';
import InventoryTable from '@/components/InventoryTable';
import DateInventoryChart from '@/components/DateInventoryChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({
    captured_date: '',
    item_type: '',
    item_code: '',
    machine_name: '',
    machine_id: '',
    uom: '',
    quality_status: '',
    mhe_no: '',
  });
  const [loading, setLoading] = useState(true);
  const [chartFilters, setChartFilters] = useState({});

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryResponse, filterOptionsResponse] = await Promise.all([
        axios.get(`${API}/inventory`),
        axios.get(`${API}/filter-options`),
      ]);
      
      setInventoryData(inventoryResponse.data);
      setFilteredData(inventoryResponse.data);
      setFilterOptions(filterOptionsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 4 hours
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 4 * 60 * 60 * 1000); // 4 hours in milliseconds

    return () => clearInterval(interval);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...inventoryData];

    // Apply panel filters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        const filterKey = key === 'captured_date' ? 'captured_date_ist' : key;
        filtered = filtered.filter((item) => {
          const itemValue = item[filterKey];
          if (key === 'captured_date') {
            return itemValue?.startsWith(filters[key]);
          }
          return itemValue === filters[key];
        });
      }
    });

    // Apply chart click filters
    Object.keys(chartFilters).forEach((key) => {
      if (chartFilters[key]) {
        filtered = filtered.filter((item) => {
          if (key === 'uom') {
            return item.uom === chartFilters[key];
          }
          if (key === 'quality_status') {
            return item.quality_status === chartFilters[key];
          }
          if (key === 'machine_name') {
            return item.machine_name === chartFilters[key];
          }
          if (key === 'item_code') {
            return item.item_code === chartFilters[key];
          }
          return true;
        });
      }
    });

    setFilteredData(filtered);
  }, [filters, chartFilters, inventoryData]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      captured_date: '',
      item_type: '',
      item_code: '',
      machine_name: '',
      machine_id: '',
      uom: '',
      quality_status: '',
      mhe_no: '',
    });
    setChartFilters({});
  };

  const handleChartClick = (filterType, value) => {
    setChartFilters((prev) => {
      if (prev[filterType] === value) {
        // Remove filter if clicking the same value
        const newFilters = { ...prev };
        delete newFilters[filterType];
        return newFilters;
      }
      return { ...prev, [filterType]: value };
    });
  };

  // Calculate UOM wise inventory for stats cards and pie chart
  const uomInventory = useMemo(() => {
    const uomMap = {};
    filteredData.forEach((item) => {
      const uom = item.uom || 'Unknown';
      const qty = parseFloat(item.current_quantity) || 0;
      uomMap[uom] = (uomMap[uom] || 0) + qty;
    });
    return uomMap;
  }, [filteredData]);

  // Calculate quality status wise inventory
  const qualityStatusInventory = useMemo(() => {
    const statusMap = {};
    filteredData.forEach((item) => {
      const status = item.quality_status || 'Unknown';
      const qty = parseFloat(item.current_quantity) || 0;
      statusMap[status] = (statusMap[status] || 0) + qty;
    });
    return statusMap;
  }, [filteredData]);

  // Calculate machine name wise inventory
  const machineInventory = useMemo(() => {
    const machineMap = {};
    filteredData.forEach((item) => {
      const machine = item.machine_name || 'Unknown';
      const qty = parseFloat(item.current_quantity) || 0;
      machineMap[machine] = (machineMap[machine] || 0) + qty;
    });
    return machineMap;
  }, [filteredData]);

  // Chart 2: Quality Status wise inventory (Horizontal Bar)
  const qualityStatusChartData = {
    labels: Object.keys(qualityStatusInventory),
    datasets: [
      {
        label: 'Inventory (Current Quantity)',
        data: Object.values(qualityStatusInventory),
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'],
      },
    ],
  };

  const qualityStatusChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const status = Object.keys(qualityStatusInventory)[index];
        handleChartClick('quality_status', status);
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Quality Status Wise Inventory',
        font: { size: 16, weight: 'bold', family: 'Work Sans' },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Inventory: ${context.parsed.x.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  // Chart 3: Machine name wise inventory (Pie)
  const machineChartData = {
    labels: Object.keys(machineInventory),
    datasets: [
      {
        label: 'Inventory',
        data: Object.values(machineInventory),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#f97316',
        ],
      },
    ],
  };

  const machineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const machine = Object.keys(machineInventory)[index];
        handleChartClick('machine_name', machine);
      }
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 11, family: 'Work Sans' },
          boxWidth: 12,
        },
      },
      title: {
        display: true,
        text: 'Machine Wise Inventory',
        font: { size: 16, weight: 'bold', family: 'Work Sans' },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  // Chart 4: UOM wise inventory (Pie)
  const uomPieChartData = {
    labels: Object.keys(uomInventory),
    datasets: [
      {
        label: 'Inventory',
        data: Object.values(uomInventory),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
    ],
  };

  const uomPieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const uom = Object.keys(uomInventory)[index];
        handleChartClick('uom', uom);
      }
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 12, family: 'Work Sans' },
          boxWidth: 15,
        },
      },
      title: {
        display: true,
        text: 'UOM Wise Inventory Distribution',
        font: { size: 16, weight: 'bold', family: 'Work Sans' },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#FFD700] py-4 px-6 shadow-md">
        <h1 className="text-3xl font-bold text-black text-center">
          JK Tyre BTP Inventory Dashboard
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          activeChartFilters={chartFilters}
        />

        {/* Stats Cards */}
        <StatsCards uomInventory={uomInventory} totalRecords={filteredData.length} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quality Status Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Bar data={qualityStatusChartData} options={qualityStatusChartOptions} />
            </div>
          </div>

          {/* Machine Wise Inventory */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Pie data={machineChartData} options={machineChartOptions} />
            </div>
          </div>

          {/* UOM Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Pie data={uomPieChartData} options={uomPieChartOptions} />
            </div>
          </div>

          {/* Date Wise Inventory */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <DateInventoryChart filteredData={filteredData} />
          </div>
        </div>

        {/* Item Code Stacked Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <ItemCodeTable filteredData={filteredData} onChartClick={handleChartClick} />
        </div>

        {/* MHE Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <MHETable filteredData={filteredData} />
        </div>

        {/* Item Code UOM Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <ItemCodeUOMTable filteredData={filteredData} />
        </div>

        {/* Final Inventory Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <InventoryTable filteredData={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;