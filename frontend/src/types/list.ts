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
  owner: string;
  sharedWith: {
    email: string;
    permission: 'read' | 'write' | 'admin';
    addedAt: Date;
    addedBy: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  todos?: Todo[];
}

export interface ListStats {
  totalTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
  dueSoonTasks: number;
  overdueTasks: number;
}
