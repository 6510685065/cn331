import { useState, useEffect } from 'react';
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
  X,
  Eye,
  User as UserIcon,
  ThumbsUp,
  Send,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Languages,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';

interface PostDetailModalProps {
  post: Post;
  currentUser: User;
  allPosts: Post[];
  onClose: () => void;
  onNavigate: (postId: string) => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onShare: (postId: string) => void;
  onReport: (postId: string) => void;
  onDelete: (postId: string) => void;
  onTranslate: (post: Post, targetLanguage: 'th' | 'en') => Promise<{
    title: string;
    content: string;
    language: 'th' | 'en';
  }>;
  appLanguage: 'th' | 'en';
}

export function PostDetailModal({
  post,
  currentUser,
  allPosts,
  onClose,
  onNavigate,
  onLike,
  onSave,
  onComment,
  onLikeComment,
  onShare,
  onReport,
  onDelete,
  onTranslate,
  appLanguage
}: PostDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [direction, setDirection] = useState(0);
  const [translatedContent, setTranslatedContent] = useState<{
    title: string;
    content: string;
    language: 'th' | 'en';
  } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const isLiked = post.likedBy.includes(currentUser.id);
  const isSaved = post.savedBy.includes(currentUser.id);
  const isOwnPost = post.author.id === currentUser.id;

  // Find current post index
  const currentIndex = allPosts.findIndex((p) => p.id === post.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allPosts.length - 1;

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

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      setDirection(-1);
      onNavigate(allPosts[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setDirection(1);
      onNavigate(allPosts[currentIndex + 1].id);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allPosts]);

  useEffect(() => {
    setTranslatedContent(null);
    setIsTranslating(false);
  }, [post.id]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const handleTranslate = async () => {
    if (translatedContent?.language === appLanguage) {
      setTranslatedContent(null);
      return;
    }

    setIsTranslating(true);

    try {
      const result = await onTranslate(post, appLanguage);
      setTranslatedContent(result);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Navigation Buttons */}
        {hasPrevious && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.2 }}
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-background/90 backdrop-blur border shadow-lg hover:bg-background transition-colors flex items-center justify-center"
            aria-label="โพสต์ก่อนหน้า"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
        )}

        {hasNext && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.2 }}
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-background/90 backdrop-blur border shadow-lg hover:bg-background transition-colors flex items-center justify-center"
            aria-label="โพสต์ถัดไป"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        )}

        {/* Modal Content */}
        <motion.div
          key={post.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-card rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-background/50 backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span id="modal-description">โพสต์ {currentIndex + 1} จาก {allPosts.length}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
              aria-label="ปิด"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" id="modal-title">{post.author.name}</span>
                      {getRoleBadge(post.author.role)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: th })}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="ตัวเลือกเพิ่มเติม">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onShare(post.id)}>แชร์โพสต์</DropdownMenuItem>
                    <DropdownMenuItem>คัดลอกลิงก์</DropdownMenuItem>
                    {isOwnPost ? (
                      <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-red-500">
                        ลบโพสต์
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onReport(post.id)} className="text-red-500">
                        รายงานโพสต์
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Post Content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h1 className="text-2xl font-bold">{translatedContent?.title ?? post.title}</h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="shrink-0"
                  >
                    {isTranslating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Languages className="w-4 h-4 mr-2" />
                    )}
                    {translatedContent?.language === appLanguage
                      ? 'แสดงต้นฉบับ'
                      : `แปลเป็น ${appLanguage === 'en' ? 'English' : 'ไทย'}`}
                  </Button>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {translatedContent?.content ?? post.content}
                </p>

                {post.image && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full object-cover"
                    />
                  </motion.div>
                )}

                {/* Post Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.comments.length} ความคิดเห็น</span>
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
                  {post.likes}
                </Button>

                <Button variant="ghost" className="flex-1">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {post.comments.length}
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
                  {post.comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CommentItem
                        comment={comment}
                        currentUser={currentUser}
                        onLike={() => onLikeComment(post.id, comment.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface CommentItemProps {
  comment: Comment;
  currentUser: User;
  onLike: () => void;
}

function CommentItem({ comment, currentUser, onLike }: CommentItemProps) {
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

          <span className="text-muted-foreground">
            {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: th })}
          </span>
        </div>
      </div>
    </div>
  );
}
