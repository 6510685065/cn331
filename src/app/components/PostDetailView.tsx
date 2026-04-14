import { useState } from 'react';
import { Post, User, Comment } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowLeft,
  Eye,
  User as UserIcon,
  ThumbsUp,
  Send,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';

interface PostDetailViewProps {
  post: Post;
  currentUser: User;
  onBack: () => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onShare: (postId: string) => void;
  onReport: (postId: string) => void;
}

export function PostDetailView({
  post,
  currentUser,
  onBack,
  onLike,
  onSave,
  onComment,
  onLikeComment,
  onShare,
  onReport
}: PostDetailViewProps) {
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const isLiked = post.likedBy.includes(currentUser.id);
  const isSaved = post.savedBy.includes(currentUser.id);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-blue-600 text-white shadow-md border-blue-700">Admin</Badge>;
      case 'club':
        return <Badge className="bg-purple-600 text-white shadow-md border-purple-700">ชมรม</Badge>;
      case 'student':
        return <Badge variant="outline" className="border-red-300 text-red-700">นักศึกษา</Badge>;
    }
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
      setReplyTo(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-card rounded-lg border">
          {/* Post Header */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{post.author.name}</span>
                    {getRoleBadge(post.author.role)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: th })}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>แชร์โพสต์</DropdownMenuItem>
                  <DropdownMenuItem>คัดลอกลิงก์</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReport(post.id)} className="text-red-500">
                    รายงานโพสต์
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Content */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{post.title}</h1>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>

              {post.image && (
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full object-cover"
                  />
                </div>
              )}

              {/* Post Metadata */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>12 ความคิดเห็น</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  <span>5 แชร์</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-around">
              <Button
                variant="ghost"
                className={`flex-1 ${isLiked ? 'text-red-500' : ''}`}
                onClick={() => onLike(post.id)}
              >
                <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                ถูกใจ
              </Button>

              <Button variant="ghost" className="flex-1">
                <MessageCircle className="w-5 h-5 mr-2" />
                แสดงความคิดเห็น
              </Button>

              <Button variant="ghost" className="flex-1" onClick={() => onShare(post.id)}>
                <Share2 className="w-5 h-5 mr-2" />
                แชร์
              </Button>

              <Button
                variant="ghost"
                className={isSaved ? 'text-blue-500' : ''}
                onClick={() => onSave(post.id)}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Comment Input */}
          <div className="p-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="เขียนความคิดเห็น..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end mt-3">
                  <Button onClick={handleSubmitComment} disabled={!commentText.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    ส่ง
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4">
              ความคิดเห็น ({post.comments.length})
            </h3>

            {post.comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็น!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {post.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUser={currentUser}
                    onLike={() => onLikeComment(post.id, comment.id)}
                    onReply={() => setReplyTo(comment.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  currentUser: User;
  onLike: () => void;
  onReply: () => void;
}

function CommentItem({ comment, currentUser, onLike, onReply }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.likes);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500 text-white text-xs">Admin</Badge>;
      case 'club':
        return <Badge className="bg-purple-500 text-white text-xs">ชมรม</Badge>;
      case 'student':
        return <Badge variant="outline" className="text-xs">นักศึกษา</Badge>;
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLocalLikes(isLiked ? localLikes - 1 : localLikes + 1);
    onLike();
  };

  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white flex-shrink-0">
        <UserIcon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">{comment.author.name}</span>
            {getRoleBadge(comment.author.role)}
          </div>
          <p className="text-sm leading-relaxed">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4 mt-2 text-sm">
          <button
            className={`flex items-center gap-1 hover:text-primary transition-colors ${
              isLiked ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
            onClick={handleLike}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            ถูกใจ {localLikes > 0 && `(${localLikes})`}
          </button>

          <button
            className="text-muted-foreground hover:text-primary transition-colors"
            onClick={onReply}
          >
            ตอบกลับ
          </button>

          <span className="text-muted-foreground">
            {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: th })}
          </span>
        </div>
      </div>
    </div>
  );
}