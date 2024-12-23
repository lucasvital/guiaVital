import { useState } from 'react';
import { Button } from '../ui/button';
import { DatePicker } from './DatePicker';
import { PrioritySelect } from './PrioritySelect';
import { CategorySelect } from './CategorySelect';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SlidersHorizontal } from 'lucide-react';
import { Priority } from '../../types/todo';

interface FilterMenuProps {
  onFilterChange: (filters: Filters) => void;
  sortBy: 'priority' | 'dueDate' | 'createdAt';
  onSortChange: (sort: 'priority' | 'dueDate' | 'createdAt') => void;
}

interface Filters {
  priority: Priority;
  categoryId: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

const initialFilters: Filters = {
  priority: 'medium',
  categoryId: null,
  dateRange: {
    from: null,
    to: null
  }
};

export function FilterMenu({ onFilterChange, sortBy, onSortChange }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      dateRange: {
        ...filters.dateRange,
        ...(newFilters.dateRange || {})
      }
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
    setOpen(false);
  };

  const activeFiltersCount = [
    filters.priority !== 'medium' ? filters.priority : null,
    filters.categoryId,
    filters.dateRange.from,
    filters.dateRange.to
  ].filter(Boolean).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <SlidersHorizontal className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prioridade</label>
            <PrioritySelect
              value={filters.priority}
              onChange={(priority) => handleFilterChange({ priority })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <CategorySelect
              selectedCategory={filters.categoryId}
              onSelect={(categoryId) => handleFilterChange({ categoryId })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Inicial</label>
            <DatePicker
              value={filters.dateRange.from}
              onChange={(date) => handleFilterChange({
                dateRange: { ...filters.dateRange, from: date }
              })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Final</label>
            <DatePicker
              value={filters.dateRange.to}
              onChange={(date) => handleFilterChange({
                dateRange: { ...filters.dateRange, to: date }
              })}
            />
          </div>

          <DropdownMenuSeparator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={() => setOpen(false)}>
              Aplicar
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
