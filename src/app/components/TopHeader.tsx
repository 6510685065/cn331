import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Bell,
  Menu,
  Search,
  Plus,
  Grid3x3,
  List,
  Zap,
  User as UserIcon,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { User } from '../types';
import { Notification, NotificationPanel } from './NotificationPanel';

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreatePost: () => void;
  viewMode: 'feed' | 'grid';
  onViewModeChange: (mode: 'feed' | 'grid') => void;
  showViewModeToggle?: boolean;
  currentUser: User;
  onViewChange: (view: string) => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function TopHeader({
  searchQuery,
  onSearchChange,
  onCreatePost,
  viewMode,
  onViewModeChange,
  showViewModeToggle = true,
  currentUser,
  onViewChange,
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead
}: TopHeaderProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 border-b border-red-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
            <Input
              placeholder="ค้นหาโพสต์, กิจกรรม..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-red-200 focus:border-red-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showViewModeToggle && (
            <div className="hidden md:flex items-center gap-1 border-2 border-red-600 rounded-lg p-1 bg-red-600 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange('feed')}
                className={`h-8 px-3 ${
                  viewMode === 'feed'
                    ? 'bg-white text-red-600 hover:bg-red-50'
                    : 'bg-transparent text-white hover:bg-red-700'
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className={`h-8 px-3 ${
                  viewMode === 'grid'
                    ? 'bg-white text-red-600 hover:bg-red-50'
                    : 'bg-transparent text-white hover:bg-red-700'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Button onClick={onCreatePost} size="sm" className="hidden md:flex bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
            <Plus className="w-4 h-4 mr-2" />
            สร้างโพสต์
          </Button>

          <Button onClick={onCreatePost} size="icon" className="md:hidden bg-gradient-to-r from-red-600 to-red-700">
            <Plus className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative bg-red-600 hover:bg-red-700 text-white">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[600px] p-0">
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onNotificationClick={onNotificationClick}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-red-600 hover:bg-red-700 text-white">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* User Info */}
              <div className="px-2 py-3">
                <div className="font-semibold text-base">{currentUser.name}</div>
                <div className="text-sm text-muted-foreground">{currentUser.email}</div>
              </div>
              <DropdownMenuSeparator />
              
              {/* Menu Items */}
              <DropdownMenuLabel className="text-sm font-semibold">
                โปรไฟล์ของฉัน
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewChange('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                ตั้งค่า
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="w-4 h-4 mr-2" />
                ช่วยเหลือ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="px-6 pb-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
          <Input
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-red-200 focus:border-red-500"
          />
        </div>
      </div>
    </header>
  );
}