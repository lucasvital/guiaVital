'use client'

import { useState } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Header } from '../components/features/Header';
import { FilterMenu } from '../components/features/FilterMenu';
import { AddTodo } from '../components/features/AddTodo';
import { Templates } from '../components/features/Templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { TodoCard } from '../components/features/TodoCard';
import { useTodos } from '../hooks/useTodos';
import { useAuth } from '../contexts/AuthContext';
import { Priority } from '../types/todo';

interface Filters {
  priority: Priority;
  categoryId: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export default function TodoList() {
  const { user, loading: authLoading } = useAuth();
  const { todos, loading, error, toggleTodo, deleteTodo, updateTodo } = useTodos();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('createdAt');
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  console.log('Current todos:', todos);

  const filteredTodos = todos.filter(todo => {
    if (searchQuery && !todo.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (filter === 'ACTIVE' && todo.completed) {
      return false;
    }
    if (filter === 'COMPLETED' && !todo.completed) {
      return false;
    }

    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Todo App</h1>
        <p className="text-muted-foreground">Please sign in to continue</p>
        <Button>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <FilterMenu
              onFilterChange={(filters: Filters) => {
                setFilter(filters.priority === 'LOW' ? 'COMPLETED' : 'ACTIVE');
              }}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          <div className="flex gap-2">
            <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Templates</DialogTitle>
                </DialogHeader>
                <Templates onOpenChange={setIsTemplatesOpen} />
              </DialogContent>
            </Dialog>
            <Dialog open={isAddTodoOpen} onOpenChange={setIsAddTodoOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Task</DialogTitle>
                </DialogHeader>
                <AddTodo onOpenChange={setIsAddTodoOpen} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTodos.length > 0 ? (
              sortedTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={() => toggleTodo(todo.id, !todo.completed)}
                  onDelete={() => deleteTodo(todo.id)}
                  onUpdate={(data) => updateTodo(todo.id, data)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                No tasks found
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
