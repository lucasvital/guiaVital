import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { Notification } from '../types/notification';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';

interface FirestoreNotification extends DocumentData {
  type: 'list_shared' | 'task_assigned' | 'task_completed';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  recipientEmail: string;
  data?: {
    listId?: string;
    taskId?: string;
    senderId?: string;
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  createNotification: (notification: Omit<FirestoreNotification, 'createdAt' | 'read'>) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'notifications'),
      where('recipientEmail', '==', user.email)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => {
          const data = doc.data() as FirestoreNotification;
          return {
            id: doc.id,
            type: data.type,
            title: data.title,
            message: data.message,
            read: data.read,
            createdAt: data.createdAt.toDate(),
            data: data.data,
          } as Notification;
        });
        setNotifications(notificationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) throw new Error('Must be logged in to mark notification as read');

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const createNotification = async (notification: Omit<FirestoreNotification, 'createdAt' | 'read'>) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        read: false,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    createNotification,
  };
}
