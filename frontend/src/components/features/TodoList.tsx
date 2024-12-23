import { useTodos } from '@/hooks/useTodos';

interface TodoListProps {
  searchQuery: string;
  priority: string | null;
  categoryId: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

export function TodoList({ searchQuery, priority, categoryId, startDate, endDate }: TodoListProps) {
  const { todos, loading, error } = useTodos();

  const filteredTodos = todos.filter(todo => {
    // Search filter
    if (searchQuery && !todo.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Priority filter
    if (priority && todo.priority !== priority) {
      return false;
    }

    // Category filter
    if (categoryId && todo.categoryId !== categoryId) {
      return false;
    }

    // Date range filter
    if (startDate && (!todo.dueDate || todo.dueDate < startDate)) {
      return false;
    }
    if (endDate && (!todo.dueDate || todo.dueDate > endDate)) {
      return false;
    }

    return true;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (filteredTodos.length === 0) {
    return <div>No tasks found</div>;
  }

  return (
    <div className="space-y-4">
      {filteredTodos.map(todo => (
        <div
          key={todo.id}
          className="p-4 bg-card rounded-lg border shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{todo.title}</h3>
            <span className="text-sm text-muted-foreground">
              {todo.dueDate?.toLocaleDateString()}
            </span>
          </div>
          {todo.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {todo.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
