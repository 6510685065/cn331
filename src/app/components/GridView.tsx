import { Post, User } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, MessageCircle, Bookmark, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface GridViewProps {
  posts: Post[];
  currentUser: User;
  onPostClick: (post: Post) => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
}

export function GridView({ posts, currentUser, onPostClick, onLike, onSave }: GridViewProps) {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      exam: '📝',
      event: '🎉',
      internship: '💼',
      announcement: '📢',
      club: '🎯',
      general: '💬'
    };
    return icons[category] || '💬';
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-blue-600 text-white text-xs shadow-md border-blue-700">Admin</Badge>;
      case 'club':
        return <Badge className="bg-purple-600 text-white text-xs shadow-md border-purple-700">ชมรม</Badge>;
      case 'student':
        return <Badge variant="outline" className="text-xs border-red-300 text-red-700">��ักศึกษา</Badge>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold">All Posts</h2>
        <Badge variant="outline" className="text-xs md:text-sm">{posts.length} Posts</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {posts.map((post) => {
          const isLiked = post.likedBy.includes(currentUser.id);
          const isSaved = post.savedBy.includes(currentUser.id);

          return (
            <Card
              key={post.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => onPostClick(post)}
            >
              {post.image && (
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {!post.image && (
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
                  <span className="text-4xl md:text-6xl">{getCategoryIcon(post.category)}</span>
                </div>
              )}

              <CardHeader className="pb-2 md:pb-3 p-3 md:p-4">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs font-medium truncate">{post.author.name}</span>
                      {getRoleBadge(post.author.role)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: th })}
                    </p>
                  </div>
                </div>

                <h3 className="font-semibold line-clamp-2 text-sm md:text-base leading-tight">
                  {post.title}
                </h3>
              </CardHeader>

              <CardContent className="py-0 px-3 md:px-4">
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{post.content}</p>
              </CardContent>

              <CardFooter className="pt-2 md:pt-3 pb-3 md:pb-4 px-3 md:px-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      className={`flex items-center gap-1 text-xs md:text-sm ${
                        isLiked ? 'text-red-500' : 'text-muted-foreground'
                      } hover:text-red-500 transition-colors`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(post.id);
                      }}
                    >
                      <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                      <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>

                  <button
                    className={`${
                      isSaved ? 'text-blue-500' : 'text-muted-foreground'
                    } hover:text-blue-500 transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave(post.id);
                    }}
                  >
                    <Bookmark className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 md:py-16 text-muted-foreground">
          <p className="text-base md:text-lg">ไม่พบโพสต์</p>
        </div>
      )}
    </div>
  );
};