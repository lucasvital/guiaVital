import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificationBell() {
  const { notifications, loading, error, markAsRead } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
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
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <p className="text-sm text-red-500 p-4">{error}</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">Nenhuma notificação</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg ${notif.read ? 'bg-muted' : 'bg-primary/10'} cursor-pointer hover:bg-accent`}
                    onClick={() => handleNotificationClick(notif.id)}
                  >
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-sm mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(notif.createdAt, { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
