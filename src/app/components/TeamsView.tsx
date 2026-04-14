import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users as UsersIcon, User as UserIcon, Crown, Star } from 'lucide-react';

interface TeamsViewProps {
  currentUser: User;
  allUsers: User[];
}

export function TeamsView({ currentUser, allUsers }: TeamsViewProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-blue-600 text-white text-xs shadow-md border-blue-700">Admin</Badge>;
      case 'club':
        return <Badge className="bg-purple-600 text-white text-xs shadow-md border-purple-700">ชมรม</Badge>;
      case 'student':
        return <Badge variant="outline" className="text-xs border-red-300 text-red-700">นักศึกษา</Badge>;
    }
  };

  const getFacultyLabel = (faculty?: string) => {
    if (!faculty) return '';
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

  // Group users by role
  const admins = allUsers.filter((u) => u.role === 'admin');
  const clubs = allUsers.filter((u) => u.role === 'club');
  const students = allUsers.filter((u) => u.role === 'student');

  const UserCard = ({ user }: { user: User }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white flex-shrink-0">
            {user.role === 'admin' ? (
              <Crown className="w-5 h-5 md:w-6 md:h-6" />
            ) : user.role === 'club' ? (
              <Star className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-sm md:text-base truncate">{user.name}</h4>
              {getRoleBadge(user.role)}
            </div>
            {user.faculty && (
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {getFacultyLabel(user.faculty)}
                {user.year && ` · ปี ${user.year}`}
              </p>
            )}
            {user.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.interests.slice(0, 3).map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {user.interests.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{user.interests.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Teams & Community</h2>
        <p className="text-sm md:text-base text-muted-foreground">เชื่อมต่อกับผู้คนในมหาวิทยาลัย</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4">
        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Crown className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">{admins.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Admins</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">{clubs.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">ชมรม</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <UsersIcon className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">{students.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">นักศึกษา</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admins Section */}
      {admins.length > 0 && (
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            Administrators
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {admins.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Clubs Section */}
      {clubs.length > 0 && (
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
            ชมรมและองค์กร
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {clubs.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Students Section */}
      {students.length > 0 && (
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <UsersIcon className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            นักศึกษา
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {students.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* My Faculty */}
      {currentUser.faculty && (
        <Card className="bg-gradient-to-br from-red-50 to-amber-50 dark:from-red-950 dark:to-amber-950">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <UsersIcon className="w-4 h-4 md:w-5 md:h-5" />
              คณะของฉัน - {getFacultyLabel(currentUser.faculty)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
              เชื่อมต่อกับนักศึกษาในคณะเดียวกัน
            </p>
            <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50 text-sm md:text-base h-9 md:h-10">
              ดูนักศึกษาในคณะ
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}