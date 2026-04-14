import { User } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Settings, User as UserIcon } from 'lucide-react';

interface UserProfileCardProps {
  user: User;
  onEditProfile: () => void;
}

export function UserProfileCard({ user, onEditProfile }: UserProfileCardProps) {
  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return <Badge className="bg-blue-600 text-white shadow-md border-blue-700">Admin</Badge>;
      case 'club':
        return <Badge className="bg-purple-600 text-white shadow-md border-purple-700">ชมรม</Badge>;
      case 'student':
        return <Badge variant="outline" className="border-red-300 text-red-700">นักศึกษา</Badge>;
    }
  };

  const getFacultyLabel = (faculty: string) => {
    const labels: Record<string, string> = {
      engineering: 'วิศวกรรมศาสตร์',
      science: 'วิทยาศาสตร์',
      arts: 'ศิลปศาสตร์',
      business: 'บริหารธุรกิจ',
      medicine: 'แพทยศาสตร์',
      law: 'นิติศาสตร์'
    };
    return labels[faculty] || faculty;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{user.name}</h3>
                {getRoleBadge()}
              </div>
              {user.faculty && (
                <p className="text-sm text-muted-foreground">
                  {getFacultyLabel(user.faculty)}
                  {user.year && ` ปี ${user.year}`}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onEditProfile}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {user.interests.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">ความสนใจ:</p>
            <div className="flex flex-wrap gap-1">
              {user.interests.map((interest) => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}