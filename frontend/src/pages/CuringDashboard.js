import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/curing`;

const CuringDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    recipe_id: '',
    status: '',
    defect_area: '',
  });

  const [productionByPress, setProductionByPress] = useState([]);
  const [productionByRecipe, setProductionByRecipe] = useState([]);
  const [productionByShift, setProductionByShift] = useState([]);
  const [dailyProduction, setDailyProduction] = useState([]);
  const [qualityByShift, setQualityByShift] = useState([]);
  const [changeoverByPress, setChangeoverByPress] = useState([]);
  const [productionTable, setProductionTable] = useState([]);
  const [qualityTable, setQualityTable] = useState([]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return params.toString();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = buildQueryParams();
      const url = queryParams ? `?${queryParams}` : '';

      const [
        summaryRes,
        filterOptionsRes,
        pressProdRes,
        recipeProdRes,
        shiftProdRes,
        dailyProdRes,
        qualityShiftRes,
        changeoverRes,
        prodTableRes,
        qualTableRes,
      ] = await Promise.all([
        axios.get(`${API}/summary${url}`),
        axios.get(`${API}/filter-options`),
        axios.get(`${API}/production-by-press${url}`),
        axios.get(`${API}/production-by-recipe${url}`),
        axios.get(`${API}/production-by-shift${url}`),
        axios.get(`${API}/daily-production${url}`),
        axios.get(`${API}/quality-by-shift${url}`),
        axios.get(`${API}/changeover-by-press${url}`),
        axios.get(`${API}/production-table${url}`),
        axios.get(`${API}/quality-data-table${url}`),
      ]);

      setSummary(summaryRes.data);
      setFilterOptions(filterOptionsRes.data);
      setProductionByPress(pressProdRes.data);
      setProductionByRecipe(recipeProdRes.data);
      setProductionByShift(shiftProdRes.data);
      setDailyProduction(dailyProdRes.data);
      setQualityByShift(qualityShiftRes.data);
      setChangeoverByPress(changeoverRes.data);
      setProductionTable(prodTableRes.data.slice(0, 50));
      setQualityTable(qualTableRes.data.slice(0, 50));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value === '_all_' ? '' : value }));
  };

  const handleClearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      recipe_id: '',
      status: '',
      defect_area: '',
    });
  };

  // Chart configurations
  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const productionByPressChart = {
    labels: productionByPress.map((d) => d.wcID),
    datasets: [
      {
        label: 'Production',
        data: productionByPress.map((d) => d.total_production),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  const productionByRecipeChart = {
    labels: productionByRecipe.map((d) => d.recipeID),
    datasets: [
      {
        label: 'Production',
        data: productionByRecipe.map((d) => d.total_production),
        backgroundColor: '#10b981',
      },
    ],
  };

  const productionByShiftChart = {
    labels: productionByShift.map((d) => `Shift ${d.shift}`),
    datasets: [
      {
        label: 'Production',
        data: productionByShift.map((d) => d.total_production),
        backgroundColor: '#f59e0b',
      },
    ],
  };

  const dailyProductionChart = {
    labels: dailyProduction.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Production',
        data: dailyProduction.map((d) => d.total_production),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const qualityByShiftChart = {
    labels: [...new Set(qualityByShift.map((d) => `Shift ${d.shift}`))],
    datasets: [...new Set(qualityByShift.map((d) => d.status_name))].map((status, idx) => ({
      label: status,
      data: [...new Set(qualityByShift.map((d) => d.shift))].map((shift) => {
        const item = qualityByShift.find((q) => q.shift === shift && q.status_name === status);
        return item ? item.count : 0;
      }),
      backgroundColor: chartColors[idx % chartColors.length],
    })),
  };

  const changeoverByPressChart = {
    labels: changeoverByPress.map((d) => d.Press_ID),
    datasets: [
      {
        label: 'Changeover Count',
        data: changeoverByPress.map((d) => d.changeover_count),
        backgroundColor: '#ef4444',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { size: 10, family: 'Work Sans' } } },
      title: { font: { size: 14, weight: 'bold', family: 'Work Sans' } },
    },
    scales: {
      x: { ticks: { font: { size: 9 } } },
      y: { beginAtZero: true },
    },
  };

  const stackedChartOptions = {
    ...chartOptions,
    scales: {
      x: { stacked: true, ticks: { font: { size: 9 } } },
      y: { stacked: true, beginAtZero: true },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Curing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#FFD700] py-3 px-6 shadow-md">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-black rounded-full w-10 h-10 flex items-center justify-center">
              <span className="text-lg font-bold text-[#FFD700]">JK</span>
            </div>
            <h1 className="text-xl font-bold text-black">JK Tyre Curing Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/dashboards')}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100 h-8 text-xs"
            >
              ← Back
            </Button>
            <Button
              onClick={() => {
                onLogout();
                navigate('/');
              }}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100 h-8 text-xs"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-4 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
            {Object.values(filters).some((v) => v) && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Recipe ID</label>
              <Select value={filters.recipe_id} onValueChange={(value) => handleFilterChange('recipe_id', value)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Recipes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all_">All Recipes</SelectItem>
                  {filterOptions.recipe_ids?.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all_">All Statuses</SelectItem>
                  {filterOptions.statuses?.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Defect Area</label>
              <Select value={filters.defect_area} onValueChange={(value) => handleFilterChange('defect_area', value)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all_">All Areas</SelectItem>
                  {filterOptions.defect_areas?.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-xs font-medium text-gray-600 uppercase">Total Production</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total_production?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <p className="text-xs font-medium text-gray-600 uppercase">Scrap Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.scrap_rate}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
            <p className="text-xs font-medium text-gray-600 uppercase">Rework Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.rework_rate}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <p className="text-xs font-medium text-gray-600 uppercase">NCM Hold</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.ncm_hold}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <p className="text-xs font-medium text-gray-600 uppercase">Avg Cycle Time</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.avg_cycle_time} min</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <p className="text-xs font-medium text-gray-600 uppercase">Avg Changeover</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.avg_changeover_time} min</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-pink-500">
            <p className="text-xs font-medium text-gray-600 uppercase">Total Changeover</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total_changeover}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-bold mb-2">Production by Press</h3>
            <div style={{ height: '280px' }}>
              <Bar data={productionByPressChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-bold mb-2">Production by Recipe (Top 15)</h3>
            <div style={{ height: '280px' }}>
              <Bar data={productionByRecipeChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-bold mb-2">Production by Shift</h3>
            <div style={{ height: '280px' }}>
              <Bar data={productionByShiftChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-bold mb-2">Daily Production</h3>
            <div style={{ height: '280px' }}>
              <Line data={dailyProductionChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-bold mb-2">Quality by Shift (Stacked)</h3>
            <div style={{ height: '280px' }}>
              <Bar data={qualityByShiftChart} options={{ ...stackedChartOptions, plugins: { ...stackedChartOptions.plugins, title: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-bold mb-2">Changeover by Press</h3>
            <div style={{ height: '280px' }}>
              <Bar data={changeoverByPressChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-base font-bold mb-3">Production Table</h3>
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Recipe ID</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">WC ID</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Mould ID</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700">Production</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productionTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs">{row.recipeID}</td>
                      <td className="px-3 py-2 text-xs">{row.wcID}</td>
                      <td className="px-3 py-2 text-xs">{row.mouldID}</td>
                      <td className="px-3 py-2 text-xs text-right">{row.total_production?.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-base font-bold mb-3">Quality Data Table</h3>
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Recipe ID</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Defect Area</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Defect</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Status</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-700">Count</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {qualityTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs">{row.tbmrecipeID}</td>
                      <td className="px-3 py-2 text-xs">{row.DefectAreaName}</td>
                      <td className="px-3 py-2 text-xs">{row.DefectNameText}</td>
                      <td className="px-3 py-2 text-xs">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{row.status_name}</span>
                      </td>
                      <td className="px-3 py-2 text-xs text-right">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuringDashboard;
