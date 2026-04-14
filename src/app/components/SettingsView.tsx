import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { X, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { faculties } from '../data/mockData';
import { useState } from 'react';

interface SettingsViewProps {
  user: User;
  onSave: (updatedUser: Partial<User>) => void;
}

export function SettingsView({ user, onSave }: SettingsViewProps) {
  const [name, setName] = useState(user.name);
  const [faculty, setFaculty] = useState(user.faculty);
  const [year, setYear] = useState(user.year);
  const [interests, setInterests] = useState<string[]>(user.interests);
  const [newInterest, setNewInterest] = useState('');

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSave = () => {
    onSave({
      name,
      faculty,
      year,
      interests
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Settings</h2>
        <p className="text-sm md:text-base text-muted-foreground">จัดการข้อมูลส่วนตัวและการตั้งค่า</p>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">ข้อมูลโปรไฟล์</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6 pt-0">
          <div>
            <Label htmlFor="name" className="text-sm md:text-base">ชื่อ</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อของคุณ"
              className="h-10 md:h-11 text-sm md:text-base mt-1.5"
            />
          </div>

          {user.role === 'student' && (
            <>
              <div>
                <Label htmlFor="faculty" className="text-sm md:text-base">คณะ</Label>
                <Select
                  value={faculty}
                  onValueChange={(value: any) => setFaculty(value)}
                >
                  <SelectTrigger className="h-10 md:h-11 text-sm md:text-base mt-1.5">
                    <SelectValue placeholder="เลือกคณะ" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((fac) => (
                      <SelectItem key={fac.value} value={fac.value} className="text-sm md:text-base">
                        {fac.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year" className="text-sm md:text-base">ชั้นปี</Label>
                <Select
                  value={year?.toString()}
                  onValueChange={(value) => setYear(parseInt(value))}
                >
                  <SelectTrigger className="h-10 md:h-11 text-sm md:text-base mt-1.5">
                    <SelectValue placeholder="เลือกชั้นปี" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((y) => (
                      <SelectItem key={y} value={y.toString()} className="text-sm md:text-base">
                        ปี {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div>
            <Label className="text-sm md:text-base">ความสนใจ</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                placeholder="เพิ่มความสนใจ..."
                className="h-10 md:h-11 text-sm md:text-base"
              />
              <Button onClick={handleAddInterest} size="icon" className="h-10 w-10 md:h-11 md:w-11 flex-shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-white text-xs md:text-sm py-1 px-2 md:px-3"
                  onClick={() => handleRemoveInterest(interest)}
                >
                  {interest}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-red-600 hover:bg-red-700 h-10 md:h-11 text-sm md:text-base">
            บันทึกการเปลี่ยนแปลง
          </Button>
        </CardContent>
      </Card>

      {/* Other Settings Cards */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">การแจ้งเตือน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm md:text-base">อีเมล</p>
              <p className="text-xs md:text-sm text-muted-foreground">รับการแจ้งเตือนทางอีเมล</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 md:h-9">เปิด</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm md:text-base">Push</p>
              <p className="text-xs md:text-sm text-muted-foreground">รับการแจ้งเตือนแบบ Push</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 md:h-9">เปิด</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-red-600 text-base md:text-lg">อันตราย</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
          <p className="text-xs md:text-sm text-muted-foreground">
            การดำเนินการเหล่านี้ไม่สามารถย้อนกลับได้
          </p>
          <Button variant="destructive" className="w-full text-sm md:text-base h-10 md:h-11">
            ลบบัญชี
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}