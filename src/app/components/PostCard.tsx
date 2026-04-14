import { useState } from 'react';
import { Post, User } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Flag,
  Pin,
  User as UserIcon,
  Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onReport: (postId: string) => void;
  onClick?: () => void;
}

export function PostCard({
  post,
  currentUser,
  onLike,
  onSave,
  onComment,
  onReport,
  onClick
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isLiked = post.likedBy.includes(currentUser.id);
  const isSaved = post.savedBy.includes(currentUser.id);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-blue-600 text-white shadow-md border-blue-700">
            <span className="mr-1">✓</span>Admin
          </Badge>
        );
      case 'club':
        return (
          <Badge className="bg-purple-600 text-white shadow-md border-purple-700">
            <span className="mr-1">✓</span>ชมรม
          </Badge>
        );
      case 'student':
        return <Badge variant="outline" className="border-red-300 text-red-700">นักศึกษา</Badge>;
    }
  };

  const getPriorityBadge = () => {
    if (post.priority === 'emergency') {
      return <Badge className="bg-purple-600 text-white shadow-lg animate-pulse border-purple-700">🚨 ด่วนมาก</Badge>;
    }
    if (post.priority === 'high') {
      return <Badge className="bg-pink-600 text-white shadow-md border-pink-700">⚡ สำคัญ</Badge>;
    }
    return null;
  };

  const getCategoryIcon = () => {
    const icons: Record<string, string> = {
      exam: '📝',
      event: '🎉',
      internship: '💼',
      announcement: '📢',
      club: '🎯',
      general: '💬'
    };
    return icons[post.category] || '💬';
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <Card 
      className={`${post.isPinned ? 'border-amber-500 border-2 shadow-md' : 'border-red-100'} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={() => onClick?.()}
    >
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                <span className="font-semibold text-sm md:text-base text-red-900 truncate">{post.author.name}</span>
                {getRoleBadge(post.author.role)}
                {post.isPinned && (
                  <Badge variant="outline" className="text-amber-600 border-amber-500 bg-amber-50 text-xs">
                    <Pin className="w-3 h-3 mr-1 fill-current" />
                    <span className="hidden sm:inline">ปักหมุด</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: th })}
              </p>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {getPriorityBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 md:p-6 pt-0">
        <div className="flex items-center gap-2">
          <span className="text-lg md:text-xl">{getCategoryIcon()}</span>
          <h3 className="font-semibold text-base md:text-lg line-clamp-2">{post.title}</h3>
        </div>

        <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap line-clamp-3 md:line-clamp-none">{post.content}</p>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full rounded-lg object-cover max-h-64 md:max-h-96"
          />
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span>เป้าหมาย:</span>
          {post.targetFaculties.length > 0 && (
            <span>
              {post.targetFaculties.length === 6
                ? 'ทุกคณะ'
                : `${post.targetFaculties.length} คณะ`}
            </span>
          )}
          {post.targetYears.length > 0 && (
            <span>• ปี {post.targetYears.join(', ')}</span>
          )}
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex-col items-stretch p-0">
        <div className="flex items-center justify-around py-2 px-2 md:px-4">
          <Button
            variant="ghost"
            size="sm"
            className={`${isLiked ? 'text-red-500' : ''} text-xs md:text-sm h-8 md:h-9 px-2 md:px-3`}
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
          >
            <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2 ${isLiked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{post.likes}</span>
            <span className="sm:hidden">{post.likes > 999 ? `${Math.floor(post.likes / 1000)}k` : post.likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
          >
            <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{post.comments.length}</span>
            <span className="sm:hidden">{post.comments.length > 999 ? `${Math.floor(post.comments.length / 1000)}k` : post.comments.length}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`${isSaved ? 'text-blue-500' : ''} text-xs md:text-sm h-8 md:h-9 px-2 md:px-3`}
            onClick={(e) => {
              e.stopPropagation();
              onSave(post.id);
            }}
          >
            <Bookmark className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2 ${isSaved ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{post.saves}</span>
            <span className="sm:hidden">{post.saves > 999 ? `${Math.floor(post.saves / 1000)}k` : post.saves}</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
            onClick={(e) => {
              e.stopPropagation();
              onReport(post.id);
            }}
          >
            <Flag className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>
        </div>

        {showComments && (
          <>
            <Separator />
            <div className="p-3 md:p-4 space-y-3 md:space-y-4" onClick={(e) => e.stopPropagation()}>
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 md:gap-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                    <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted rounded-lg p-2 md:p-3">
                      <p className="font-semibold text-xs md:text-sm">{comment.author.name}</p>
                      <p className="text-xs md:text-sm break-words">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 mt-1 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(comment.createdAt, {
                          addSuffix: true,
                          locale: th
                        })}
                      </span>
                      <button className="hover:text-foreground">
                        ถูกใจ {comment.likes > 0 && `(${comment.likes})`}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Textarea
                  placeholder="แสดงความคิดเห็น..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[60px] md:min-h-[80px] text-sm md:text-base"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  size="icon"
                  className="flex-shrink-0 h-[60px] w-[60px] md:h-auto md:w-auto"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}