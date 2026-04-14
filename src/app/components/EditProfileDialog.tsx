import { useState, useEffect } from 'react';
import { User, Faculty } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { faculties } from '../data/mockData';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSave: (updatedUser: Partial<User>) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  onSave
}: EditProfileDialogProps) {
  const [name, setName] = useState(user.name);
  const [faculty, setFaculty] = useState<Faculty | undefined>(user.faculty);
  const [year, setYear] = useState<number | undefined>(user.year);
  const [interests, setInterests] = useState<string[]>(user.interests);
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    setName(user.name);
    setFaculty(user.faculty);
    setYear(user.year);
    setInterests(user.interests);
  }, [user]);

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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขโปรไฟล์</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">ชื่อ</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อของคุณ"
            />
          </div>

          {user.role === 'student' && (
            <>
              <div>
                <Label htmlFor="faculty">คณะ</Label>
                <Select
                  value={faculty}
                  onValueChange={(value) => setFaculty(value as Faculty)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกคณะ" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((fac) => (
                      <SelectItem key={fac.value} value={fac.value}>
                        {fac.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">ชั้นปี</Label>
                <Select
                  value={year?.toString()}
                  onValueChange={(value) => setYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกชั้นปี" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        ปี {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="interests">ความสนใจ</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="interests"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="เพิ่มความสนใจ..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
              />
              <Button type="button" onClick={handleAddInterest}>
                เพิ่ม
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="gap-1">
                  {interest}
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave}>บันทึก</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
