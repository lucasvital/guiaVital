export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface List {
  id: string;
  name: string;
  color: string;
  emoji?: string;
  ownerId: string;
  members: ListMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ListMember {
  userId: string;
  email: string;
  role: 'admin' | 'editor' | 'reader';
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  listId?: string;
  categoryId?: string;
  assignedTo?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  templateId?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  tasks: TemplateTask[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateTask {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  emoji?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
