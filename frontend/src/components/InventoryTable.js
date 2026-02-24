import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const InventoryTable = ({ filteredData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div data-testid="inventory-table">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Complete Inventory Data</h3>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold sticky top-0 bg-white">Captured Date (IST)</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Date of Production</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Time of Production</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Shift</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Machine Display Name</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Machine Display ID</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Item Type</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Item Code</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Lot No.</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white text-right">Current Quantity</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">UOM</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">MHE No.</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Quality Status</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Use After</TableHead>
              <TableHead className="font-bold sticky top-0 bg-white">Use Before</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="whitespace-nowrap">
                  {row.captured_date_ist ? new Date(row.captured_date_ist).toLocaleString('en-IN') : 'N/A'}
                </TableCell>
                <TableCell>{row.date_of_production || 'N/A'}</TableCell>
                <TableCell>{row.time_of_production || 'N/A'}</TableCell>
                <TableCell>{row.shift || 'N/A'}</TableCell>
                <TableCell>{row.machine_display_name || 'N/A'}</TableCell>
                <TableCell>{row.machine_display_id || 'N/A'}</TableCell>
                <TableCell>{row.item_type || 'N/A'}</TableCell>
                <TableCell className="font-medium">{row.item_code || 'N/A'}</TableCell>
                <TableCell>{row.lot_no || 'N/A'}</TableCell>
                <TableCell className="text-right">{parseFloat(row.current_quantity || 0).toFixed(2)}</TableCell>
                <TableCell>{row.uom || 'N/A'}</TableCell>
                <TableCell>{row.mhe_no || 'N/A'}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      row.quality_status === 'PASS' || row.quality_status === 'OK'
                        ? 'bg-green-100 text-green-800'
                        : row.quality_status === 'HOLD'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {row.quality_status || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>{row.use_after || 'N/A'}</TableCell>
                <TableCell>{row.use_before || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            data-testid="prev-page-button"
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            data-testid="next-page-button"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;