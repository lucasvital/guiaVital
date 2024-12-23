import { List } from '../../types/list';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Settings2, Share2, Trash2 } from 'lucide-react';

export interface ListCardProps {
  list: List;
  onSelect: () => void;
  onEdit: (list: List) => void;
  onDelete: (listId: string) => void;
  onShare: (listId: string) => void;
}

export function ListCard({
  list,
  onSelect,
  onEdit,
  onDelete,
  onShare
}: ListCardProps) {
  const stats = {
    completed: list.todos?.filter(todo => todo.completed).length || 0,
    total: list.todos?.length || 0,
    highPriority: list.todos?.filter(todo => todo.priority === 'high').length || 0,
    dueSoon: list.todos?.filter(todo => {
      if (!todo.dueDate) return false;
      const now = new Date();
      const diffDays = Math.ceil((todo.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays > 0;
    }).length || 0,
    overdue: list.todos?.filter(todo => {
      if (!todo.dueDate) return false;
      const now = new Date();
      return todo.dueDate < now;
    }).length || 0
  };

  return (
    <Card
      onClick={onSelect}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">
          <div className="flex items-center gap-2">
            {list.icon && <span>{list.icon}</span>}
            <span style={{ color: list.color }}>{list.name}</span>
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onShare(list.id);
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(list);
            }}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(list.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{stats.completed}/{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tarefas Completadas</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{stats.highPriority}</div>
            <p className="text-xs text-muted-foreground">Alta Prioridade</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">{stats.dueSoon}</div>
            <p className="text-xs text-muted-foreground">Vence em Breve</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Atrasadas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
