import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MHETable = ({ filteredData }) => {
  const mheData = useMemo(() => {
    const mheMap = {};

    filteredData.forEach((item) => {
      const itemType = item.item_type || 'Unknown';
      const uom = item.uom || 'Unknown';
      const mheNo = item.mhe_no || 'Unknown';
      const qty = parseFloat(item.current_quantity) || 0;

      const key = `${itemType}_${uom}`;
      if (!mheMap[key]) {
        mheMap[key] = {
          itemType,
          uom,
          mheNos: new Set(),
          inventory: 0,
        };
      }

      mheMap[key].mheNos.add(mheNo);
      mheMap[key].inventory += qty;
    });

    return Object.values(mheMap).map((item) => ({
      ...item,
      mheCount: item.mheNos.size,
    }));
  }, [filteredData]);

  return (
    <div data-testid="mhe-table">
      <h3 className="text-lg font-bold text-gray-800 mb-4">MHE Table</h3>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Item Type</TableHead>
              <TableHead className="font-bold">UOM</TableHead>
              <TableHead className="font-bold text-right">Distinct MHE Count</TableHead>
              <TableHead className="font-bold text-right">Inventory</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mheData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.itemType}</TableCell>
                <TableCell>{row.uom}</TableCell>
                <TableCell className="text-right">{row.mheCount}</TableCell>
                <TableCell className="text-right">{row.inventory.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MHETable;