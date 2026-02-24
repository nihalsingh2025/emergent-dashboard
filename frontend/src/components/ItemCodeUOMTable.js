import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ItemCodeUOMTable = ({ filteredData }) => {
  const itemCodeData = useMemo(() => {
    const itemMap = {};

    filteredData.forEach((item) => {
      const code = item.item_code || 'Unknown';
      const uom = item.uom || 'Unknown';
      const mheNo = item.mhe_no || 'Unknown';
      const qty = parseFloat(item.current_quantity) || 0;

      const key = `${code}_${uom}`;
      if (!itemMap[key]) {
        itemMap[key] = {
          itemCode: code,
          uom,
          mheNos: new Set(),
          inventory: 0,
        };
      }

      itemMap[key].mheNos.add(mheNo);
      itemMap[key].inventory += qty;
    });

    return Object.values(itemMap)
      .map((item) => ({
        ...item,
        mheCount: item.mheNos.size,
      }))
      .sort((a, b) => b.inventory - a.inventory);
  }, [filteredData]);

  return (
    <div data-testid="item-code-uom-table">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Item Code Analysis
      </h3>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Item Code</TableHead>
              <TableHead className="font-bold">UOM</TableHead>
              <TableHead className="font-bold text-right">Inventory</TableHead>
              <TableHead className="font-bold text-right">Distinct MHE Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemCodeData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.itemCode}</TableCell>
                <TableCell>{row.uom}</TableCell>
                <TableCell className="text-right">{row.inventory.toFixed(2)}</TableCell>
                <TableCell className="text-right">{row.mheCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ItemCodeUOMTable;
