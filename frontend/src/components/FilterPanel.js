import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const FilterPanel = ({ filters, filterOptions, onFilterChange, onClearFilters, activeChartFilters }) => {
  const hasActiveFilters = Object.values(filters).some((v) => v) || Object.keys(activeChartFilters).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4" data-testid="filter-panel">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">Filters</h2>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
            data-testid="clear-filters-button"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Chart Filters */}
      {Object.keys(activeChartFilters).length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-gray-600">Active Chart Filters:</span>
          {Object.entries(activeChartFilters).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              {key.replace('_', ' ')}: {value}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Date Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
          <Input
            type="date"
            value={filters.start_date}
            onChange={(e) => onFilterChange('start_date', e.target.value)}
            className="h-9 text-sm"
            data-testid="filter-start-date"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
          <Input
            type="date"
            value={filters.end_date}
            onChange={(e) => onFilterChange('end_date', e.target.value)}
            className="h-9 text-sm"
            data-testid="filter-end-date"
          />
        </div>

        {/* Item Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Item Type</label>
          <Select value={filters.item_type} onValueChange={(value) => onFilterChange('item_type', value === '_all_' ? '' : value)}>
            <SelectTrigger data-testid="filter-item-type" className="h-9 text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">All Types</SelectItem>
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
          <label className="block text-xs font-medium text-gray-700 mb-1">Item Code</label>
          <Select value={filters.item_code} onValueChange={(value) => onFilterChange('item_code', value === '_all_' ? '' : value)}>
            <SelectTrigger data-testid="filter-item-code" className="h-9 text-sm">
              <SelectValue placeholder="All Codes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">All Codes</SelectItem>
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
          <label className="block text-xs font-medium text-gray-700 mb-1">Machine Name</label>
          <Select value={filters.machine_name} onValueChange={(value) => onFilterChange('machine_name', value === '_all_' ? '' : value)}>
            <SelectTrigger data-testid="filter-machine-name" className="h-9 text-sm">
              <SelectValue placeholder="All Machines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">All Machines</SelectItem>
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
          <label className="block text-xs font-medium text-gray-700 mb-1">Machine No.</label>
          <Select value={filters.machine_id} onValueChange={(value) => onFilterChange('machine_id', value === '_all_' ? '' : value)}>
            <SelectTrigger data-testid="filter-machine-id" className="h-9 text-sm">
              <SelectValue placeholder="All Machine Nos." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">All Machine Nos.</SelectItem>
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
          <label className="block text-xs font-medium text-gray-700 mb-1">UOM</label>
          <Select value={filters.uom} onValueChange={(value) => onFilterChange('uom', value === '_all_' ? '' : value)}>
            <SelectTrigger data-testid="filter-uom" className="h-9 text-sm">
              <SelectValue placeholder="All UOMs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">All UOMs</SelectItem>
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
          <label className="block text-xs font-medium text-gray-700 mb-1">Quality Status</label>
          <Select value={filters.quality_status} onValueChange={(value) => onFilterChange('quality_status', value === '_all_' ? '' : value)}>
            <SelectTrigger data-testid="filter-quality-status" className="h-9 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">All Statuses</SelectItem>
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
          <label className="block text-xs font-medium text-gray-700 mb-1">MHE No.</label>
          <Select value={filters.mhe_no} onValueChange={(value) => onFilterChange('mhe_no', value === '_all_' ? '' : value)}>
            <SelectTrigger data-testid="filter-mhe-no" className="h-9 text-sm">
              <SelectValue placeholder="All MHE Nos." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">All MHE Nos.</SelectItem>
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