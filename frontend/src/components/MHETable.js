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
      <h3 className="text-base font-bold text-gray-800 mb-3">MHE Table</h3>
      <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-xs">Item Type</TableHead>
              <TableHead className="font-bold text-xs">UOM</TableHead>
              <TableHead className="font-bold text-xs text-right">MHE Count</TableHead>
              <TableHead className="font-bold text-xs text-right">Inventory</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mheData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-xs">{row.itemType}</TableCell>
                <TableCell className="text-xs">{row.uom}</TableCell>
                <TableCell className="text-right text-xs">{row.mheCount}</TableCell>
                <TableCell className="text-right text-xs">{row.inventory.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MHETable;