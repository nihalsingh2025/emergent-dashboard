import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

const DateInventoryChart = ({ filteredData }) => {
  const dateInventory = useMemo(() => {
    const dateMap = {};
    filteredData.forEach((item) => {
      const date = item.captured_date_ist?.split('T')[0] || 'Unknown';
      const qty = parseFloat(item.current_quantity) || 0;
      dateMap[date] = (dateMap[date] || 0) + qty;
    });
    const sortedDates = Object.keys(dateMap).sort();
    return {
      labels: sortedDates,
      values: sortedDates.map((date) => dateMap[date]),
    };
  }, [filteredData]);

  const chartData = {
    labels: dateInventory.labels,
    datasets: [
      {
        label: 'Inventory',
        data: dateInventory.values,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Date Wise Inventory',
        font: { size: 14, weight: 'bold', family: 'Work Sans' },
      },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div style={{ height: '280px' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default DateInventoryChart;