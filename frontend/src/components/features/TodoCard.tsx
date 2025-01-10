import { Card } from '../ui/card';
import { Button } from '../ui/button';
import Checkbox from '../ui/checkbox';
import { Todo, SubTask } from '../../types/todo';
import { MoreVertical, Calendar, Tag, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCategories } from '../../hooks/useCategories';
import { useLists } from '../../hooks/useLists';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete: () => void;
  onDelete: () => void;
  onUpdate: (data: Partial<Todo>) => void;
}

const priorityColors = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
  LOW: 'bg-blue-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-red-500',
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

export function TodoCard({
  todo,
  onToggleComplete,
  onDelete,
  onUpdate,
}: TodoCardProps) {
  const { categories } = useCategories();
  const { lists } = useLists();

  const category = categories?.find(c => c.id === todo.categoryId);
  const list = lists?.find(l => l.id === todo.listId);
  const subtasks = todo.subtasks || [];

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={onToggleComplete}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          {/* Título e Menu */}
          <div className="flex items-start justify-between gap-2">
            <span className={cn(
              "font-medium",
              todo.completed && "line-through text-muted-foreground"
            )}>
              {todo.title}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Informações adicionais */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            {/* Prioridade */}
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-2 h-2 rounded-full",
                priorityColors[todo.priority]
              )} />
              <span>{priorityLabels[todo.priority]}</span>
            </div>

            {/* Lista */}
            {list && (
              <div className="flex items-center gap-1.5">
                <ListTodo className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: list.color }} 
                  />
                  <span>{list.name}</span>
                </div>
              </div>
            )}

            {/* Categoria */}
            {category && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: category.color }} 
                  />
                  <span>{category.name}</span>
                </div>
              </div>
            )}

            {/* Data de vencimento */}
            {todo.dueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(todo.dueDate, "dd 'de' MMM", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>

          {/* Subtarefas */}
          {subtasks.length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              {subtasks.filter((st: SubTask) => st.completed).length} de {subtasks.length} subtarefas completas
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
