'use client'

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/features/Header';
import { FilterMenu } from '../components/features/FilterMenu';
import { ListManager } from '../components/features/ListManager';
import { CategoryManager } from '../components/features/CategoryManager';
import { AddTodo } from '../components/features/AddTodo';
import { Todo } from '../types/todo';
import { Plus, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { TodoCard } from '../components/features/TodoCard';
import { priorityOrder } from '../lib/constants';
import { useTodos } from '../hooks/useTodos';

export default function TodoList() {
  const { user, loading: authLoading } = useAuth();
  const { todos, toggleTodo, deleteTodo, updateTodo } = useTodos();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('createdAt');
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
  const [isListManagerOpen, setIsListManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const handleSelectList = (listId: string | null) => {
    setSelectedListId(listId);
    setIsListManagerOpen(false);
  };

  const sortTodos = (todos: Todo[]) => {
    return [...todos].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.valueOf() - a.dueDate.valueOf();
        case 'createdAt':
          return b.createdAt.valueOf() - a.createdAt.valueOf();
        default:
          return 0;
      }
    });
  };

  const filteredTodos = sortTodos(todos.filter((todo) => {
    switch (filter) {
      case 'ACTIVE':
        return !todo.completed;
      case 'COMPLETED':
        return todo.completed;
      default:
        return true;
    }
  })).filter(todo => {
    const matchesSearch = 
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.tags?.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
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
                className="pl-10 w-[300px]"
              />
            </div>
            <FilterMenu onFilterChange={() => {}} />
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isListManagerOpen} onOpenChange={setIsListManagerOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Manage Lists</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Manage Lists</DialogTitle>
                </DialogHeader>
                <ListManager 
                  onSelectList={handleSelectList}
                  selectedListId={selectedListId}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isCategoryManagerOpen} onOpenChange={setIsCategoryManagerOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Manage Categories</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>
                <CategoryManager />
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
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <AddTodo />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggleComplete={() => toggleTodo(todo.id, !todo.completed)}
              onDelete={() => deleteTodo(todo.id)}
              onUpdate={(data) => updateTodo(todo.id, data)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
