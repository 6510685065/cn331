import { useState } from 'react';
import { User, Faculty, PostCategory, PostPriority } from '../types';
import type { GenerationStreamEvent } from '../lib/bootstrap';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { categories, faculties } from '../data/mockData';
import { Loader2, Sparkles, Upload, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User;
  onCreatePost: (postData: {
    title: string;
    content: string;
    category: PostCategory;
    priority: PostPriority;
    targetFaculties: Faculty[];
    targetYears: number[];
    image?: string;
  }) => Promise<void> | void;
  onGenerateFromImage: (
    image: string,
    onEvent?: (event: GenerationStreamEvent) => void,
  ) => Promise<{
    title: string;
    content: string;
    category: PostCategory;
    priority: PostPriority;
    targetFaculties: Faculty[];
    targetYears: number[];
  }>;
}

export function CreatePostDialog({
  open,
  onOpenChange,
  currentUser,
  onCreatePost,
  onGenerateFromImage
}: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('general');
  const [priority, setPriority] = useState<PostPriority>('normal');
  const [targetFaculties, setTargetFaculties] = useState<Faculty[]>([]);
  const [targetYears, setTargetYears] = useState<number[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [aiProgress, setAiProgress] = useState(0);
  const [aiLiveText, setAiLiveText] = useState('');
  const [aiError, setAiError] = useState('');

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setPriority('normal');
    setTargetFaculties([]);
    setTargetYears([]);
    setImageUrl('');
    setImagePreview('');
    setIsSubmitting(false);
    setIsGenerating(false);
    setAiStatus('');
    setAiProgress(0);
    setAiLiveText('');
    setAiError('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setAiError('');
    setAiStatus('กำลังตรวจสอบเนื้อหาโพสต์ก่อนเผยแพร่');
    setAiProgress(20);

    try {
      await onCreatePost({
        title,
        content,
        category,
        priority,
        targetFaculties,
        targetYears,
        image: imageUrl || undefined
      });

      resetForm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
      setAiStatus('');
      setAiProgress(0);
    }
  };

  const toggleFaculty = (faculty: Faculty) => {
    setTargetFaculties((prev) =>
      prev.includes(faculty) ? prev.filter((f) => f !== faculty) : [...prev, faculty]
    );
  };

  const toggleYear = (year: number) => {
    setTargetYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const selectAllFaculties = () => {
    if (targetFaculties.length === faculties.length) {
      setTargetFaculties([]);
    } else {
      setTargetFaculties(faculties.map((f) => f.value));
    }
  };

  const selectAllYears = () => {
    if (targetYears.length === 4) {
      setTargetYears([]);
    } else {
      setTargetYears([1, 2, 3, 4]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageUrl('');
  };

  const handleGenerateFromImage = async () => {
    if (!imageUrl) return;

    setIsGenerating(true);
    setAiError('');
    setAiStatus('กำลังเตรียมรูปภาพ');
    setAiProgress(5);
    setAiLiveText('');

    try {
      const draft = await onGenerateFromImage(imageUrl, (event) => {
        if (event.type === 'status') {
          setAiStatus(event.message ?? '');
          setAiProgress(event.progress ?? 0);
        }

        if (event.type === 'token' && event.token) {
          setAiLiveText((prev) => {
            if (prev.includes('\n{')) {
              return prev;
            }

            const next = `${prev}${event.token}`.trimStart();
            const jsonStart = next.indexOf('\n{');
            return jsonStart >= 0 ? next.slice(0, jsonStart).trimEnd() : next;
          });
        }
      });
      setTitle(draft.title);
      setContent(draft.content);
      setCategory(draft.category);
      setPriority(draft.priority);
      setTargetFaculties(draft.targetFaculties);
      setTargetYears(draft.targetYears);
      setAiStatus('สร้างร่างโพสต์เสร็จแล้ว');
      setAiProgress(100);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'ไม่สามารถสร้างเนื้อหาจากภาพได้');
      setAiProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl text-gray-900">สร้างโพสต์ใหม่</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">กรอกข้อมูลที่จำเป็นเพื่อสร้างโพสต์ใหม่</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-base mb-2 block text-gray-900">หัวข้อ *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="หัวข้อโพสต์..."
              className="h-12 text-base bg-red-50/50 border-red-100 focus:border-red-300 focus:ring-red-200"
            />
          </div>

          <div>
            <Label htmlFor="content" className="text-base mb-2 block text-gray-900">เนื้อหา *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนเนื้อหาโพสต์ที่นี่..."
              className="min-h-[150px] text-base bg-red-50/50 border-red-100 focus:border-red-300 focus:ring-red-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-base mb-2 block text-gray-900">หมวดหมู่</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as PostCategory)}>
                <SelectTrigger className="h-12 text-base bg-red-50/50 border-red-100 focus:border-red-300 focus:ring-red-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-base py-3">
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentUser.role === 'admin' && (
              <div>
                <Label htmlFor="priority" className="text-base mb-2 block text-gray-900">ระดับความสำคัญ</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as PostPriority)}
                >
                  <SelectTrigger className="h-12 text-base bg-red-50/50 border-red-100 focus:border-red-300 focus:ring-red-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="normal" className="text-base py-3">ปกติ</SelectItem>
                    <SelectItem value="high" className="text-base py-3">⚡ สำคัญ</SelectItem>
                    <SelectItem value="emergency" className="text-base py-3">🚨 ด่วนมาก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base text-gray-900">กลุ่มเป้าหมาย - คณะ</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={selectAllFaculties}
                className="h-auto p-0 text-base text-red-500 hover:text-red-600"
              >
                {targetFaculties.length === faculties.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {faculties.map((faculty) => (
                <div key={faculty.value} className="flex items-center space-x-3 py-1">
                  <Checkbox
                    id={faculty.value}
                    checked={targetFaculties.includes(faculty.value)}
                    onCheckedChange={() => toggleFaculty(faculty.value)}
                    className="w-5 h-5 border-red-200 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                  />
                  <label
                    htmlFor={faculty.value}
                    className="text-base cursor-pointer select-none text-gray-900"
                  >
                    {faculty.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base text-gray-900">กลุ่มเป้าหมาย - ชั้นปี</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={selectAllYears}
                className="h-auto p-0 text-base text-red-500 hover:text-red-600"
              >
                {targetYears.length === 4 ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((year) => (
                <div key={year} className="flex items-center space-x-3 py-1">
                  <Checkbox
                    id={`year-${year}`}
                    checked={targetYears.includes(year)}
                    onCheckedChange={() => toggleYear(year)}
                    className="w-5 h-5 border-red-200 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                  />
                  <label
                    htmlFor={`year-${year}`}
                    className="text-base cursor-pointer select-none text-gray-900"
                  >
                    ปี {year}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="file" className="text-base mb-2 block text-gray-900">รูปภาพ</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 transition-colors relative ${
                isDragging 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-red-200 hover:border-red-300 hover:bg-red-50/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="text-base font-medium text-gray-900">ลากและวางรูปภาพที่นี่</p>
                  <p className="text-sm text-gray-500 mt-1">หรือคลิกเพื่อเลือกไฟล์ (PNG, JPG, GIF)</p>
                </div>
              </div>
            </div>
            {imagePreview && (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border-2 border-red-100"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 shadow-lg w-10 h-10 bg-red-500 hover:bg-red-600"
                  onClick={removeImage}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}
            {(isGenerating || isSubmitting || aiStatus || aiLiveText || aiError) && (
              <div className="mt-4 space-y-3">
                <Alert className={aiError ? 'border-red-300 bg-red-50' : 'border-amber-200 bg-amber-50'}>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>{aiError ? 'AI ทำงานไม่สำเร็จ' : 'สถานะ AI'}</AlertTitle>
                  <AlertDescription>
                    <p>{aiError || aiStatus || 'กำลังประมวลผล'}</p>
                  </AlertDescription>
                </Alert>
                {!aiError && (isGenerating || isSubmitting || aiProgress > 0) && (
                  <Progress value={aiProgress} className="h-2" />
                )}
                {aiLiveText && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="mb-1 font-medium text-slate-900">ข้อความสดจากโมเดล</p>
                    <p className="whitespace-pre-wrap leading-relaxed">{aiLiveText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-6 gap-3 sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={handleGenerateFromImage}
            disabled={!imageUrl || isGenerating || isSubmitting}
            className="h-11 px-6 text-base bg-amber-100 text-amber-900 hover:bg-amber-200"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            สร้างเนื้อหาจากภาพ
          </Button>
          <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11 px-6 text-base border-gray-300 text-gray-700 hover:bg-gray-50" disabled={isSubmitting || isGenerating}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim() || isSubmitting || isGenerating} className="h-11 px-6 text-base bg-red-500 hover:bg-red-600 text-white">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            โพสต์
          </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
