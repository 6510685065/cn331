import { Post, User } from '../types';
import { PostCard } from './PostCard';
import { Badge } from './ui/badge';

interface FeedViewProps {
  posts: Post[];
  currentUser: User;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onReport: (postId: string) => void;
  onPostClick?: (post: Post) => void;
}

export function FeedView({
  posts,
  currentUser,
  onLike,
  onSave,
  onComment,
  onReport,
  onPostClick
}: FeedViewProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold">Your Feed</h2>
        <Badge variant="outline" className="text-xs md:text-sm">{posts.length} Posts</Badge>
      </div>

      <div className="space-y-3 md:space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 md:py-16 text-muted-foreground">
            <p className="text-base md:text-lg">ไม่พบโพสต์</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={onLike}
              onSave={onSave}
              onComment={onComment}
              onReport={onReport}
              onClick={onPostClick ? () => onPostClick(post) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}