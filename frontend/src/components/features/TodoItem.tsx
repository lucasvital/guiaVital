import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Todo, SubTask } from '../../types/todo';
import Checkbox from '../ui/checkbox';
import { useCategories } from '../../hooks/useCategories';
import { useLists } from '../../hooks/useLists';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const { categories } = useCategories();
  const { lists } = useLists();

  const category = categories.find(c => c.id === todo.categoryId);
  const list = lists.find(l => l.id === todo.listId);

  const priorityColor = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-blue-500',
  }[todo.priority];

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg border',
      todo.completed && 'opacity-50'
    )}>
      <Checkbox
        id={todo.id}
        checked={todo.completed}
        onCheckedChange={(checked: boolean) => onToggle(todo.id, checked)}
        className="mt-1"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('font-medium', todo.completed && 'line-through')}>
            {todo.title}
          </span>
          <span className={cn('text-sm font-medium', priorityColor)}>
            {todo.priority.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          {list && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: list.color }} />
              <span>{list.name}</span>
            </div>
          )}
          
          {category && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
              <span>{category.name}</span>
            </div>
          )}

          {todo.dueDate && (
            <Badge variant="outline">
              Vence em {format(todo.dueDate, "PPP", { locale: ptBR })}
            </Badge>
          )}
        </div>

        {todo.subtasks.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {todo.subtasks.filter((st: SubTask) => st.completed).length} de {todo.subtasks.length} subtarefas completas
          </div>
        )}
      </div>
    </div>
  );
}
