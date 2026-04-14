import { useState, useMemo, useCallback } from 'react';
import { User, Post, PostCategory, Faculty, PostPriority } from './types';
import { mockUsers, mockPosts, mockNotifications } from './data/mockData';
import { Notification } from './components/NotificationPanel';
import { useDebounce } from './hooks/useDebounce';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { FeedView } from './components/FeedView';
import { GridView } from './components/GridView';
import { CalendarView } from './components/CalendarView';
import { TeamsView } from './components/TeamsView';
import { SettingsView } from './components/SettingsView';
import { ResumeView } from './components/ResumeView';
import { FilterPanel } from './components/FilterPanel';
import { CreatePostDialog } from './components/CreatePostDialog';
import { PostDetailModal } from './components/PostDetailModal';
import { Button } from './components/ui/button';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[2]); // Default: Engineering student
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'popular'>('relevance');
  const [showSaved, setShowSaved] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [currentView, setCurrentView] = useState('posts');
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Calculate relevance score for a post
  const calculateRelevanceScore = (post: Post): number => {
    let score = 0;

    // Priority boost
    if (post.priority === 'emergency') score += 1000;
    if (post.priority === 'high') score += 500;
    if (post.isPinned) score += 800;

    // Faculty match
    if (currentUser.faculty && post.targetFaculties.includes(currentUser.faculty)) {
      score += 300;
    }

    // Year match
    if (currentUser.year && post.targetYears.includes(currentUser.year)) {
      score += 200;
    }

    // Interest match
    const postText = `${post.title} ${post.content}`.toLowerCase();
    currentUser.interests.forEach((interest) => {
      if (postText.includes(interest.toLowerCase())) {
        score += 150;
      }
    });

    // Category relevance
    if (post.category === 'exam' || post.category === 'announcement') {
      score += 100;
    }

    // Engagement (popularity)
    score += post.likes * 2;
    score += post.comments.length * 5;
    score += post.saves * 3;

    // Recency (decay over time)
    const hoursSincePost = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
    score -= hoursSincePost * 2;

    return score;
  };

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search
    if (debouncedSearchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    // Filter by saved
    if (showSaved) {
      filtered = filtered.filter((post) => post.savedBy.includes(currentUser.id));
    }

    // Sort posts
    const sorted = [...filtered];
    if (sortBy === 'relevance') {
      sorted.sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a));
    } else if (sortBy === 'recent') {
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'popular') {
      sorted.sort((a, b) => {
        const scoreA = a.likes + a.comments.length * 2 + a.saves;
        const scoreB = b.likes + b.comments.length * 2 + b.saves;
        return scoreB - scoreA;
      });
    }

    return sorted;
  }, [posts, debouncedSearchQuery, selectedCategory, sortBy, showSaved, currentUser]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalPosts: posts.length,
      savedPosts: posts.filter((p) => p.savedBy.includes(currentUser.id)).length,
      myPosts: posts.filter((p) => p.author.id === currentUser.id).length
    };
  }, [posts, currentUser]);

  // Handlers
  const handleLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = post.likedBy.includes(currentUser.id);
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            likedBy: isLiked
              ? post.likedBy.filter((id) => id !== currentUser.id)
              : [...post.likedBy, currentUser.id]
          };
        }
        return post;
      })
    );
  }, [currentUser.id]);

  const handleSave = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isSaved = post.savedBy.includes(currentUser.id);
          if (!isSaved) {
            toast.success('บันทึกโพสต์แล้ว');
          }
          return {
            ...post,
            saves: isSaved ? post.saves - 1 : post.saves + 1,
            savedBy: isSaved
              ? post.savedBy.filter((id) => id !== currentUser.id)
              : [...post.savedBy, currentUser.id]
          };
        }
        return post;
      })
    );
  }, [currentUser.id]);

  const handleComment = useCallback((postId: string, content: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `comment-${Date.now()}`,
                author: currentUser,
                content,
                createdAt: new Date(),
                likes: 0
              }
            ]
          };
        }
        return post;
      })
    );
    toast.success('แสดงความคิดเห็นแล้ว');
  }, [currentUser]);

  const handleLikeComment = useCallback((postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map((comment) =>
              comment.id === commentId
                ? { ...comment, likes: comment.likes + 1 }
                : comment
            )
          };
        }
        return post;
      })
    );
  }, []);

  const handleShare = useCallback((postId: string) => {
    // Copy link to clipboard
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success('คัดลอกลิงก์แล้ว');
  }, []);

  const handleReport = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, reports: post.reports + 1 } : post
      )
    );
    toast.success('รายงานโพสต์แล้ว ขอบคุณที่ช่วยรักษาคุณภาพของชุมชน');
  }, []);

  const handleCreatePost = useCallback((postData: {
    title: string;
    content: string;
    category: PostCategory;
    priority: PostPriority;
    targetFaculties: Faculty[];
    targetYears: number[];
    image?: string;
  }) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: currentUser,
      ...postData,
      createdAt: new Date(),
      likes: 0,
      comments: [],
      saves: 0,
      reports: 0,
      isPinned: false,
      likedBy: [],
      savedBy: []
    };
    setPosts([newPost, ...posts]);
    toast.success('โพสต์สำเร็จ!');
  }, [currentUser, posts]);

  const handleSaveProfile = useCallback((updatedData: Partial<User>) => {
    setCurrentUser({ ...currentUser, ...updatedData });
    toast.success('บันทึกโปรไฟล์แล้ว');
  }, [currentUser]);

  const handleViewChange = useCallback((view: string) => {
    setCurrentView(view);
    // Reset filters when changing views
    if (view === 'saved') {
      setShowSaved(true);
      setCurrentView('posts');
    } else {
      setShowSaved(false);
    }
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (notification.postId) {
      const post = posts.find(p => p.id === notification.postId);
      if (post) {
        setSelectedPost(post);
        // Switch to posts view if not already there
        if (currentView !== 'posts') {
          setCurrentView('posts');
        }
      }
    }
  }, [posts, currentView]);

  const handleMarkNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const handleMarkAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, []);

  // Render main content based on current view
  const renderMainContent = () => {
    switch (currentView) {
      case 'posts':
        return (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="flex-1 min-w-0">
              {viewMode === 'feed' ? (
                <FeedView
                  posts={filteredPosts}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onSave={handleSave}
                  onComment={handleComment}
                  onReport={handleReport}
                  onPostClick={setSelectedPost}
                />
              ) : (
                <GridView
                  posts={filteredPosts}
                  currentUser={currentUser}
                  onPostClick={setSelectedPost}
                  onLike={handleLike}
                  onSave={handleSave}
                />
              )}
            </div>
            <aside className="w-full lg:w-64 xl:w-72 hidden xl:block">
              <div className="sticky top-24">
                <FilterPanel
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  showSaved={showSaved}
                  onShowSavedChange={setShowSaved}
                />
              </div>
            </aside>
          </div>
        );

      case 'calendar':
        return (
          <CalendarView
            posts={posts.filter(
              (p) => p.category === 'event' || p.category === 'exam'
            )}
            onPostClick={setSelectedPost}
          />
        );

      case 'teams':
        return <TeamsView currentUser={currentUser} allUsers={mockUsers} />;

      case 'settings':
        return <SettingsView user={currentUser} onSave={handleSaveProfile} />;

      case 'resume':
        return <ResumeView currentUser={currentUser} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster />

      {/* Show Post Detail View if post is selected */}
      {selectedPost && (
        <PostDetailModal
          post={posts.find((p) => p.id === selectedPost.id) || selectedPost}
          currentUser={currentUser}
          allPosts={filteredPosts}
          onClose={() => setSelectedPost(null)}
          onNavigate={(postId) => {
            const nextPost = posts.find((p) => p.id === postId);
            if (nextPost) setSelectedPost(nextPost);
          }}
          onLike={handleLike}
          onSave={handleSave}
          onComment={handleComment}
          onLikeComment={handleLikeComment}
          onShare={handleShare}
          onReport={handleReport}
        />
      )}

      <>
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar
            user={currentUser}
            currentView={currentView}
            onViewChange={handleViewChange}
            stats={stats}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreatePost={() => setIsCreatePostOpen(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showViewModeToggle={currentView === 'posts'}
            currentUser={currentUser}
            onViewChange={handleViewChange}
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={handleMarkNotificationAsRead}
            onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          />

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Mobile Filter Pills */}
              {currentView === 'posts' && (
                <div className="xl:hidden mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="whitespace-nowrap text-xs md:text-sm h-8 md:h-9"
                  >
                    ทั้งหมด
                  </Button>
                  <Button
                    variant={selectedCategory === 'exam' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('exam')}
                    className="whitespace-nowrap text-xs md:text-sm h-8 md:h-9"
                  >
                    📝 ข่าวสอบ
                  </Button>
                  <Button
                    variant={selectedCategory === 'event' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('event')}
                    className="whitespace-nowrap text-xs md:text-sm h-8 md:h-9"
                  >
                    🎉 กิจกรรม
                  </Button>
                  <Button
                    variant={selectedCategory === 'internship' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('internship')}
                    className="whitespace-nowrap text-xs md:text-sm h-8 md:h-9"
                  >
                    💼 Internship
                  </Button>
                </div>
              )}

              {renderMainContent()}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50 pb-safe">
          <div className="grid grid-cols-5 gap-0.5 p-1 md:p-2">
            <Button
              variant={currentView === 'posts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('posts')}
              className="flex flex-col h-auto py-1.5 md:py-2 px-1 text-xs md:text-sm"
            >
              <span>Posts</span>
            </Button>
            <Button
              variant={currentView === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('calendar')}
              className="flex flex-col h-auto py-1.5 md:py-2 px-1 text-xs md:text-sm"
            >
              <span>Calendar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatePostOpen(true)}
              className="flex flex-col h-auto py-1.5 md:py-2 px-1 text-xs md:text-sm"
            >
              <span>Create</span>
            </Button>
            <Button
              variant={currentView === 'teams' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('teams')}
              className="flex flex-col h-auto py-1.5 md:py-2 px-1 text-xs md:text-sm"
            >
              <span>Teams</span>
            </Button>
            <Button
              variant={currentView === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('settings')}
              className="flex flex-col h-auto py-1.5 md:py-2 px-1 text-xs md:text-sm"
            >
              <span>Settings</span>
            </Button>
          </div>
        </div>

        {/* Dialogs */}
        <CreatePostDialog
          open={isCreatePostOpen}
          onOpenChange={setIsCreatePostOpen}
          currentUser={currentUser}
          onCreatePost={handleCreatePost}
        />
      </>
    </div>
  );
}