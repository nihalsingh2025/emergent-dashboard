import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FilterPanel = ({ filters, filterOptions, onFilterChange, onClearFilters, activeChartFilters }) => {
  const hasActiveFilters = Object.values(filters).some((v) => v) || Object.keys(activeChartFilters).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6" data-testid="filter-panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            data-testid="clear-filters-button"
          >
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Active Chart Filters */}
      {Object.keys(activeChartFilters).length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-600">Active Chart Filters:</span>
          {Object.entries(activeChartFilters).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="bg-blue-100 text-blue-800">
              {key.replace('_', ' ')}: {value}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Captured Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Captured Date (IST)</label>
          <Select value={filters.captured_date} onValueChange={(value) => onFilterChange('captured_date', value)}>
            <SelectTrigger data-testid="filter-captured-date">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Dates</SelectItem>
              {filterOptions.captured_dates?.map((date) => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Item Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Type</label>
          <Select value={filters.item_type} onValueChange={(value) => onFilterChange('item_type', value)}>
            <SelectTrigger data-testid="filter-item-type">
              <SelectValue placeholder="Select item type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {filterOptions.item_types?.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Item Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Code</label>
          <Select value={filters.item_code} onValueChange={(value) => onFilterChange('item_code', value)}>
            <SelectTrigger data-testid="filter-item-code">
              <SelectValue placeholder="Select item code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Codes</SelectItem>
              {filterOptions.item_codes?.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Machine Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Machine Name</label>
          <Select value={filters.machine_name} onValueChange={(value) => onFilterChange('machine_name', value)}>
            <SelectTrigger data-testid="filter-machine-name">
              <SelectValue placeholder="Select machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Machines</SelectItem>
              {filterOptions.machine_names?.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Machine ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Machine No.</label>
          <Select value={filters.machine_id} onValueChange={(value) => onFilterChange('machine_id', value)}>
            <SelectTrigger data-testid="filter-machine-id">
              <SelectValue placeholder="Select machine no." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Machine Nos.</SelectItem>
              {filterOptions.machine_ids?.map((id) => (
                <SelectItem key={id} value={id}>
                  {id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* UOM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">UOM</label>
          <Select value={filters.uom} onValueChange={(value) => onFilterChange('uom', value)}>
            <SelectTrigger data-testid="filter-uom">
              <SelectValue placeholder="Select UOM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All UOMs</SelectItem>
              {filterOptions.uoms?.map((uom) => (
                <SelectItem key={uom} value={uom}>
                  {uom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quality Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quality Status</label>
          <Select value={filters.quality_status} onValueChange={(value) => onFilterChange('quality_status', value)}>
            <SelectTrigger data-testid="filter-quality-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {filterOptions.quality_statuses?.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* MHE No. */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">MHE No.</label>
          <Select value={filters.mhe_no} onValueChange={(value) => onFilterChange('mhe_no', value)}>
            <SelectTrigger data-testid="filter-mhe-no">
              <SelectValue placeholder="Select MHE no." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All MHE Nos.</SelectItem>
              {filterOptions.mhe_nos?.map((mhe) => (
                <SelectItem key={mhe} value={mhe}>
                  {mhe}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;