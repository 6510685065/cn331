import { useState, useMemo } from 'react';
import { Bell, MessageSquare, Heart, Bookmark, AlertCircle, Calendar, Megaphone, CheckCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export type NotificationType = 
  | 'comment'
  | 'like'
  | 'announcement'
  | 'event'
  | 'exam'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  postId?: string;
  actionUrl?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick
}: NotificationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = useMemo(() => {
    const filtered = filter === 'unread' 
      ? notifications.filter(n => !n.isRead)
      : notifications;
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-amber-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'exam':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'system':
        return <Bell className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
    
    return date.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">การแจ้งเตือน</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs text-red-600 hover:text-red-700"
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            อ่านทั้งหมด
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="w-full">
        <TabsList className="w-full grid grid-cols-2 px-4 pt-2">
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            ยังไม่อ่าน
            {unreadCount > 0 && (
              <span className="ml-1 text-xs text-red-600">({unreadCount})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="m-0">
          <ScrollArea className="h-[400px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">
                  {filter === 'unread' ? 'ไม่มีการแจ้งเตือนใหม่' : 'ยังไม่มีการแจ้งเตือน'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-red-50/50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-red-50/30' : ''
                    }`}
                    onClick={() => {
                      onNotificationClick(notification);
                      if (!notification.isRead) {
                        onMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationPanel;