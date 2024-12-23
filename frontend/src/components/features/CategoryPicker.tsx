import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Tag } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'casa', name: 'Casa', color: '#16a34a' },
  { id: 'trabalho', name: 'Trabalho', color: '#2563eb' },
  { id: 'pessoal', name: 'Pessoal', color: '#9333ea' },
  { id: 'urgente', name: 'Urgente', color: '#dc2626' },
  { id: 'compras', name: 'Compras', color: '#ca8a04' },
];

interface CategoryPickerProps {
  value?: string;
  onChange: (categoryId: string) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = DEFAULT_CATEGORIES.find(cat => cat.id === value);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span>{selectedCategory.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <Tag className="h-4 w-4" />
              <span>Categoria</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="p-1">
          {DEFAULT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`w-full flex items-center gap-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                value === category.id ? 'bg-slate-100 dark:bg-slate-800' : ''
              }`}
              onClick={() => {
                onChange(category.id);
                setIsOpen(false);
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
