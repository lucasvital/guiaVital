import { Button } from '../ui/button';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ListItemProps {
  list: {
    id: string;
    title: string;
  };
  selected?: boolean;
  onSelect: (listId: string) => void;
  onDelete: (listId: string) => void;
  onShare: (list: { id: string; title: string }) => React.ReactNode;
}

export function ListItem({ list, selected, onSelect, onDelete, onShare }: ListItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 ${
        selected ? 'bg-secondary' : ''
      }`}
    >
      <button
        className="flex-1 text-left"
        onClick={() => onSelect(list.id)}
      >
        {list.title}
      </button>
      <div className="flex items-center gap-2">
        {onShare(list)}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(list.id)}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
