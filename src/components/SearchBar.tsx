
import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, ApplicationStatus } from '@/types/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  className?: string;
}

const SearchBar = ({ filter, onFilterChange, className }: SearchBarProps) => {
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [searchValue, setSearchValue] = useState(filter.search);
  
  useEffect(() => {
    setSearchValue(filter.search);
  }, [filter.search]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Debounce search
    const debounceTimer = setTimeout(() => {
      onFilterChange({
        ...filter,
        search: value
      });
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  };
  
  // Handle search clear
  const handleClearSearch = () => {
    setSearchValue('');
    onFilterChange({
      ...filter,
      search: ''
    });
  };
  
  // Handle status filter change
  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filter,
      status: value as ApplicationStatus | 'all'
    });
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    onFilterChange({
      ...filter,
      sortBy: value as 'date' | 'company' | 'status'
    });
  };
  
  // Handle sort order change
  const handleSortOrderChange = (value: string) => {
    onFilterChange({
      ...filter,
      sortOrder: value as 'asc' | 'desc'
    });
  };
  
  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
          <Search className="w-4 h-4" />
        </div>
        <Input
          type="search"
          placeholder="Search for jobs by company, position, or location..."
          className="pl-10 pr-10 py-6 bg-background text-foreground"
          value={searchValue}
          onChange={handleSearchChange}
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
            onClick={handleClearSearch}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex items-center gap-1"
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {filter.status !== 'all' && (
            <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs mr-2">
              Status: {filter.status.charAt(0).toUpperCase() + filter.status.slice(1)}
            </span>
          )}
          {filter.sortBy !== 'date' && (
            <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
              Sort: {filter.sortBy.charAt(0).toUpperCase() + filter.sortBy.slice(1)}
            </span>
          )}
        </div>
      </div>
      
      {isFiltersVisible && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border animate-fade-in">
          <div className="space-y-2">
            <label className="text-xs font-medium">Status</label>
            <Select 
              value={filter.status} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="saved">Saved</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium">Sort By</label>
            <Select 
              value={filter.sortBy} 
              onValueChange={handleSortChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium">Order</label>
            <Select 
              value={filter.sortOrder} 
              onValueChange={handleSortOrderChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
