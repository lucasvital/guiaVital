import { Timestamp } from 'firebase/firestore';

export type Priority = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Date;
  reminder?: Date;
  listId?: string;
  categoryId?: string;
  tags: Tag[];
  subtasks: SubTask[];
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TodoList {
  id: string;
  title: string;
  todos: Todo[];
  userId: string;
  sharedWith?: string[];
  createdAt: number;
}

export interface ListStats {
  completed: number;
  total: number;
  highPriority: number;
  dueSoon: number;
  overdue: number;
}
