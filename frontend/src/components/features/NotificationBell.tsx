import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { collection, query, where, onSnapshot, updateDoc, doc, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  userId: string;
}

interface NotificationData extends DocumentData {
  message: string;
  read: boolean;
  createdAt: Timestamp;
  userId: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => {
        const data = doc.data() as NotificationData;
        return {
          id: doc.id,
          message: data.message,
          read: data.read,
          createdAt: data.createdAt,
          userId: data.userId
        };
      });

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);

      // Mostrar notificações não lidas como notificações do sistema
      if ('Notification' in window && Notification.permission === 'granted') {
        notifs.filter(n => !n.read).forEach(notif => {
          new Notification('Nova notificação', {
            body: notif.message,
          });
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        read: true,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Notificações</h4>
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg ${notif.read ? 'bg-muted' : 'bg-primary/10'} cursor-pointer`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notif.createdAt.toDate().toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
