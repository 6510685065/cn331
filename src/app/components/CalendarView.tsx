import { useState } from 'react';
import { Post } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';

interface CalendarViewProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

export function CalendarView({ posts, onPostClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getPostsForDate = (date: Date) => {
    return posts.filter((post) => isSameDay(post.createdAt, date));
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad the start to align with week
    const startDay = monthStart.getDay();
    const paddedDays = [
      ...Array(startDay).fill(null),
      ...days
    ];

    return (
      <div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3">
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
          <div key={day} className="text-center text-xs md:text-sm font-semibold text-muted-foreground py-1 md:py-2">
            {day}
          </div>
        ))}
        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-[60px] md:min-h-[100px] lg:min-h-[120px]" />;
          }

          const dayPosts = getPostsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const hasEvents = dayPosts.length > 0;

          return (
            <Card
              key={day.toString()}
              className={`min-h-[60px] md:min-h-[100px] lg:min-h-[120px] p-1.5 md:p-2 lg:p-3 cursor-pointer transition-all duration-200 ${
                isToday 
                  ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 shadow-lg' 
                  : hasEvents
                  ? 'border border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10'
                  : 'border'
              } ${isSelected ? 'ring-2 ring-primary/50' : ''} hover:shadow-md`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="flex flex-col h-full">
                <div className={`text-xs md:text-sm lg:text-base font-semibold mb-1 md:mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="flex-1 space-y-0.5 md:space-y-1 overflow-hidden">
                  {dayPosts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className="text-[10px] md:text-xs truncate px-1 md:px-1.5 py-0.5 md:py-1 bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-100 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPostClick(post);
                      }}
                    >
                      {post.title}
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className="text-[9px] md:text-xs text-muted-foreground px-1 md:px-1.5">
                      +{dayPosts.length - 2} เพิ่มเติม
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const selectedDayPosts = getPostsForDate(selectedDate);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Calendar</h2>
        <p className="text-sm md:text-base text-muted-foreground">ตารางกิจกรรมและข่าวสาร</p>
      </div>

      <Card>
        <CardHeader className="p-3 md:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg lg:text-xl flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
              {format(currentDate, 'MMMM yyyy', { locale: th })}
            </CardTitle>
            <div className="flex gap-1 md:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="h-8 w-8 md:h-9 md:w-9"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(new Date())}
                className="h-8 w-8 md:h-9 md:w-9 hidden md:flex"
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="h-8 w-8 md:h-9 md:w-9"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 lg:p-6 pt-0">
          {renderMonthView()}
        </CardContent>
      </Card>

      {/* Events for Selected Date */}
      <Card>
        <CardHeader className="p-3 md:p-4 lg:p-6">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
            {format(selectedDate, 'dd MMMM yyyy', { locale: th })}
            <Badge variant="secondary" className="ml-auto text-xs md:text-sm">
              {selectedDayPosts.length} กิจกรรม
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
          {selectedDayPosts.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-muted-foreground">
              <p className="text-sm md:text-base">ไม่มีกิจกรรมในวันนี้</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {selectedDayPosts.map((post) => (
                <Card
                  key={post.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onPostClick(post)}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="text-xl md:text-2xl">
                        {post.category === 'exam' ? '📝' : '🎉'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base mb-1">{post.title}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}