import { User } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  LayoutGrid,
  Calendar,
  Users,
  Settings,
  FileText,
  User as UserIcon,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import tuLogo from 'figma:asset/19eff9b8125bb9fa4eae986fb9feeab43db902e1.png';

interface SidebarProps {
  user: User;
  currentView: string;
  onViewChange: (view: string) => void;
  showSaved: boolean;
  showMyPosts: boolean;
  onToggleSavedPosts: () => void;
  onToggleMyPosts: () => void;
  stats: {
    totalPosts: number;
    savedPosts: number;
    myPosts: number;
  };
}

export function Sidebar({
  user,
  currentView,
  onViewChange,
  showSaved,
  showMyPosts,
  onToggleSavedPosts,
  onToggleMyPosts,
  stats,
}: SidebarProps) {
  const menuItems = [
    { id: 'posts', label: 'Posts', icon: LayoutGrid, badge: stats.totalPosts },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'teams', label: 'Teams & Clubs', icon: Users },
    { id: 'resume', label: 'Resume', icon: FileText }
  ];

  return (
    <aside className="w-52 h-screen border-r border-red-200 bg-card sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 bg-gradient-to-br from-red-50 to-amber-50 flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          <img src={tuLogo} alt="Thammasat University" className="w-12 h-12 object-contain mix-blend-multiply" />
        </div>
        <div>
          <h1 className="text-base font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
            Smart Campus
          </h1>
          <p className="text-xs text-red-700/70 mt-0">Thammasat University</p>
        </div>
      </div>

      <Separator className="bg-red-200" />

      {/* User Profile */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-red-50 to-amber-50 border border-red-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-red-900">{user.name}</p>
            <p className="text-xs text-red-700/70 truncate">{user.faculty}</p>
            <span className={`inline-block mt-0.5 px-1.5 py-0 text-[10px] font-medium rounded-full border ${
              user.role === 'professor'
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : user.role === 'admin'
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : user.role === 'club'
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-blue-100 text-blue-700 border-blue-200'
            }`}>
              {user.role === 'professor' ? 'อาจารย์' : user.role === 'admin' ? 'แอดมิน' : user.role === 'club' ? 'ชมรม' : 'นักศึกษา'}
            </span>
          </div>
        </div>
      </div>

      <Separator className="bg-red-200" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentView === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start h-9 px-3 ${
                currentView === item.id 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800' 
                  : 'hover:bg-red-50 text-red-900'
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {item.badge !== undefined && (
                <Badge variant="secondary" className="ml-auto text-xs bg-amber-500 text-white border-amber-600">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      <Separator className="bg-red-200" />

      {/* Stats */}
      <div className="px-3 py-3 space-y-2 bg-red-50/50">
        <button
          type="button"
          onClick={onToggleSavedPosts}
          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
            showSaved
              ? 'bg-red-100 text-red-900'
              : 'text-red-700/70 hover:bg-red-100/70 hover:text-red-900'
          }`}
        >
          <span className="text-red-700/70">Saved</span>
          <span className="font-semibold text-red-900">{stats.savedPosts}</span>
        </button>
        <button
          type="button"
          onClick={onToggleMyPosts}
          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
            showMyPosts
              ? 'bg-red-100 text-red-900'
              : 'text-red-700/70 hover:bg-red-100/70 hover:text-red-900'
          }`}
        >
          <span className="text-red-700/70">My Posts</span>
          <span className="font-semibold text-red-900">{stats.myPosts}</span>
        </button>
      </div>
    </aside>
  );
}
