import { Timestamp } from 'firebase/firestore';
import { Todo } from './todo';

export type Permission = 'admin' | 'editor' | 'reader';

export interface ListMember {
  userId: string;
  email: string;
  permission: Permission;
}

export interface List {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdBy: string;
  members: ListMember[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  todos: Todo[];
}

export interface ListStats {
  completed: number;
  total: number;
  highPriority: number;
  dueSoon: number;
  overdue: number;
}
