import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

const ItemCodeTable = ({ filteredData, onChartClick }) => {
  const itemCodeData = useMemo(() => {
    const itemMap = {};
    filteredData.forEach((item) => {
      const code = item.item_code || 'Unknown';
      const uom = item.uom || 'Unknown';
      const qty = parseFloat(item.current_quantity) || 0;

      if (!itemMap[code]) {
        itemMap[code] = {};
      }
      itemMap[code][uom] = (itemMap[code][uom] || 0) + qty;
    });

    const sortedItems = Object.entries(itemMap)
      .map(([code, uoms]) => ({
        code,
        total: Object.values(uoms).reduce((sum, qty) => sum + qty, 0),
        uoms,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);

    return sortedItems;
  }, [filteredData]);

  const allUoms = [...new Set(filteredData.map((item) => item.uom || 'Unknown'))];

  const chartData = {
    labels: itemCodeData.map((item) => item.code),
    datasets: allUoms.map((uom, index) => ({
      label: uom,
      data: itemCodeData.map((item) => item.uoms[uom] || 0),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][index % 8],
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const code = itemCodeData[index].code;
        onChartClick('item_code', code);
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 10, family: 'Work Sans' }, boxWidth: 12 },
      },
      title: {
        display: true,
        text: 'Item Code Wise Inventory (Stacked by UOM) - Top 15',
        font: { size: 14, weight: 'bold', family: 'Work Sans' },
      },
    },
    scales: {
      x: { stacked: true, ticks: { font: { size: 9 } } },
      y: { stacked: true, beginAtZero: true },
    },
  };

  return (
    <div style={{ height: '320px' }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default ItemCodeTable;