import { MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react';
import { List, ListStats } from '../../types/list';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface ListCardProps {
  list: List;
  onEdit: (list: List) => void;
  onDelete: (listId: string) => void;
  onShare: (listId: string) => void;
  selected?: boolean;
  onSelect?: () => void;
}

export function ListCard({ list, onEdit, onDelete, onShare, selected, onSelect }: ListCardProps) {
  // Calcular estatísticas
  const stats: ListStats = {
    totalTasks: list.todos?.length || 0,
    completedTasks: list.todos?.filter(todo => todo.completed).length || 0,
    highPriorityTasks: list.todos?.filter(todo => todo.priority === 'HIGH').length || 0,
    dueSoonTasks: list.todos?.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDate = todo.dueDate instanceof Date ? todo.dueDate : new Date(todo.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && daysUntilDue >= 0;
    }).length || 0,
    overdueTasks: list.todos?.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDate = todo.dueDate instanceof Date ? todo.dueDate : new Date(todo.dueDate);
      return dueDate < new Date();
    }).length || 0,
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer",
        "hover:shadow-md transition-shadow",
        selected && "ring-2 ring-primary",
      )}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: list.color,
      }}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {list.icon && <span className="text-xl">{list.icon}</span>}
          <h3 className="font-semibold">{list.name}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit(list);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onShare(list.id);
            }}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(list.id);
              }}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Estatísticas */}
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Total de tarefas:</span>
          <span>{stats.totalTasks}</span>
        </div>
        <div className="flex justify-between">
          <span>Concluídas:</span>
          <span>{stats.completedTasks}</span>
        </div>
        {stats.highPriorityTasks > 0 && (
          <div className="flex justify-between text-red-500">
            <span>Alta prioridade:</span>
            <span>{stats.highPriorityTasks}</span>
          </div>
        )}
        {stats.dueSoonTasks > 0 && (
          <div className="flex justify-between text-yellow-500">
            <span>Vencem em breve:</span>
            <span>{stats.dueSoonTasks}</span>
          </div>
        )}
        {stats.overdueTasks > 0 && (
          <div className="flex justify-between text-red-500">
            <span>Atrasadas:</span>
            <span>{stats.overdueTasks}</span>
          </div>
        )}
      </div>

      {/* Barra de progresso */}
      <div className="mt-4">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${stats.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
