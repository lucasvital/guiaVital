import { Timestamp } from 'firebase/firestore';

export type Priority = 'low' | 'medium' | 'high' | 'LOW' | 'MEDIUM' | 'HIGH';

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

export interface SharedUser {
  email: string;
  permission: 'read' | 'write' | 'admin';
  addedAt: Date;
  addedBy?: string;
}

export interface List {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdBy: string;
  owner: string;
  sharedWith: SharedUser[];
  members?: string[];
  createdAt: Date;
  updatedAt?: Date;
  todos?: Todo[];
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
