"use client";

import { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIndustries, useDepartments, useJobRoles } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

export interface FilterState {
  industry: string | null;
  department: string | null;
  jobrole: string | null;
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

export function Filters({ filters, onFiltersChange, className }: FiltersProps) {
  const { data: industries = [] } = useIndustries();
  const { data: departments = [] } = useDepartments(filters.industry);
  const { data: jobRoles = [] } = useJobRoles(filters.department);

  const updateFilter = (key: keyof FilterState, value: string | null) => {
    const newFilters = { ...filters };
    
    if (key === 'industry') {
      newFilters.industry = value;
      newFilters.department = null;
      newFilters.jobrole = null;
    } else if (key === 'department') {
      newFilters.department = value;
      newFilters.jobrole = null;
    } else {
      newFilters.jobrole = value;
    }
    
    onFiltersChange(newFilters);
  };

  const clearFilter = (key: keyof FilterState) => {
    updateFilter(key, null);
  };

  const clearAllFilters = () => {
    onFiltersChange({ industry: null, department: null, jobrole: null });
  };

  const hasActiveFilters = filters.industry || filters.department || filters.jobrole;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Industry</label>
          <Select
            value={filters.industry || "all-industries"}
            onValueChange={(value) => updateFilter('industry', value === "all-industries" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-industries">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry.id} value={industry.id}>
                  {industry.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Department</label>
          <Select
            value={filters.department || "all-departments"}
            onValueChange={(value) => updateFilter('department', value === "all-departments" ? null : value)}
            disabled={!filters.industry}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-departments">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Job Role</label>
          <Select
            value={filters.jobrole || "all-job-roles"}
            onValueChange={(value) => updateFilter('jobrole', value === "all-job-roles" ? null : value)}
            disabled={!filters.department}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-job-roles">All Job Roles</SelectItem>
              {jobRoles.map((jobRole) => (
                <SelectItem key={jobRole.id} value={jobRole.id}>
                  {jobRole.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.industry && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Industry: {industries.find(i => i.id === filters.industry)?.title}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-500"
                onClick={() => clearFilter('industry')}
              />
            </Badge>
          )}
          {filters.department && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Department: {departments.find(d => d.id === filters.department)?.title}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-500"
                onClick={() => clearFilter('department')}
              />
            </Badge>
          )}
          {filters.jobrole && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Job Role: {jobRoles.find(j => j.id === filters.jobrole)?.title}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-500"
                onClick={() => clearFilter('jobrole')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}