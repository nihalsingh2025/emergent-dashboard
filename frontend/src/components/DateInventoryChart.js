import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

const DateInventoryChart = ({ filteredData }) => {
  const dateInventory = useMemo(() => {
    const dateMap = {};
    
    // Group by date and UOM
    filteredData.forEach((item) => {
      const dateStr = item.captured_date_ist?.split('T')[0];
      if (!dateStr) return;
      
      const uom = item.uom || 'Unknown';
      const qty = parseFloat(item.current_quantity) || 0;
      
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = {};
      }
      dateMap[dateStr][uom] = (dateMap[dateStr][uom] || 0) + qty;
    });
    
    const sortedDates = Object.keys(dateMap).sort();
    const allUoms = [...new Set(filteredData.map(item => item.uom || 'Unknown'))];
    
    return {
      labels: sortedDates,
      uoms: allUoms,
      data: dateMap
    };
  }, [filteredData]);

  const chartData = {
    labels: dateInventory.labels,
    datasets: dateInventory.uoms.map((uom, index) => ({
      label: uom,
      data: dateInventory.labels.map(date => dateInventory.data[date][uom] || 0),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 10, family: 'Work Sans' }, boxWidth: 12 },
      },
      title: {
        display: true,
        text: 'Date Wise Inventory (Stacked by UOM)',
        font: { size: 14, weight: 'bold', family: 'Work Sans' },
      },
    },
    scales: {
      x: { 
        stacked: true,
        ticks: { font: { size: 9 } }
      },
      y: { 
        stacked: true,
        beginAtZero: true 
      },
    },
  };

  return (
    <div style={{ height: '280px' }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default DateInventoryChart;