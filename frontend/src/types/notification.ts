export interface Notification {
  id: string;
  type: 'list_shared' | 'task_assigned' | 'task_completed';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: {
    listId?: string;
    taskId?: string;
    senderId?: string;
  };
}
