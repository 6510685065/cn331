import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { LoginPage } from './components/LoginPage';
import { Button } from './components/ui/button';
import {
  ApiError,
  createComment,
  createPost,
  deletePost,
  fetchBootstrapData,
  generatePostFromImage,
  streamGeneratePostFromImage,
  likeComment,
  loadBootstrapData,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  moderatePostDraft,
  reportPost,
  translatePostContent,
  togglePostLike,
  togglePostSave,
  updateUserProfile,
} from './lib/bootstrap';
import {
  login as authLogin,
  logout as authLogout,
  getSession,
  isAuthenticated as checkIsAuthenticated,
} from './lib/auth';

export default function App() {
  // ── Authentication state ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<User>(mockUsers[2]); // Default: Engineering student
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'popular'>('relevance');
  const [showSaved, setShowSaved] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [currentView, setCurrentView] = useState('posts');
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');
  const [appLanguage, setAppLanguage] = useState<'th' | 'en'>(() => {
    if (typeof window === 'undefined') {
      return 'th';
    }

    return window.localStorage.getItem('app-language') === 'en' ? 'en' : 'th';
  });

  useEffect(() => {
    window.localStorage.setItem('app-language', appLanguage);
  }, [appLanguage]);

  // ── Check existing session on mount ──
  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (!checkIsAuthenticated()) {
        setAuthLoading(false);
        return;
      }

      try {
        const sessionUser = await getSession();
        if (!isMounted) return;

        if (sessionUser) {
          setCurrentUser(sessionUser);
          setIsAuthenticated(true);
        }
      } catch {
        // Session invalid — stay on login page.
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Login handler ──
  const handleLogin = useCallback(async (username: string, password: string) => {
    const result = await authLogin(username, password);
    setCurrentUser(result.user);
    setIsAuthenticated(true);
    toast.success(`ยินดีต้อนรับ ${result.user.name}`);
  }, []);

  // ── Logout handler ──
  const handleLogout = useCallback(async () => {
    await authLogout();
    setIsAuthenticated(false);
    setCurrentUser(mockUsers[2]);
    setUsers(mockUsers);
    setPosts(mockPosts);
    setNotifications(mockNotifications);
    setDataSource('mock');
    setCurrentView('posts');
    toast.success('ออกจากระบบแล้ว');
  }, []);

  const refreshFromApi = useCallback(async (preferredCurrentUserId?: string) => {
    const freshData = await fetchBootstrapData(preferredCurrentUserId ?? currentUser.id);
    setCurrentUser(freshData.currentUser);
    setUsers(freshData.users);
    setPosts(freshData.posts);
    setNotifications(freshData.notifications);
    setDataSource(freshData.source);

    if (selectedPost) {
      const updatedSelectedPost = freshData.posts.find((post) => post.id === selectedPost.id) ?? null;
      setSelectedPost(updatedSelectedPost);
    }
  }, [currentUser.id, selectedPost]);

  // ── Load bootstrap data when authenticated ──
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    loadBootstrapData().then((data) => {
      if (!isMounted) return;

      setCurrentUser(data.currentUser);
      setUsers(data.users);
      setPosts(data.posts);
      setNotifications(data.notifications);
      setDataSource(data.source);

      if (data.source === 'api') {
        toast.success('โหลดข้อมูลจากฐานข้อมูลสำเร็จ');
      } else {
        toast.message('กำลังใช้ mock data ชั่วคราว');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

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

    // Filter by my posts
    if (showMyPosts) {
      filtered = filtered.filter((post) => post.author.id === currentUser.id);
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
  }, [posts, debouncedSearchQuery, selectedCategory, sortBy, showSaved, showMyPosts, currentUser]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalPosts: posts.length,
      savedPosts: posts.filter((p) => p.savedBy.includes(currentUser.id)).length,
      myPosts: posts.filter((p) => p.author.id === currentUser.id).length
    };
  }, [posts, currentUser]);

  // Handlers
  const handleLike = useCallback(async (postId: string) => {
    if (dataSource === 'api') {
      try {
        await togglePostLike(postId, currentUser.id);
        await refreshFromApi(currentUser.id);
      } catch (error) {
        console.error(error);
        toast.error('ไม่สามารถกดถูกใจโพสต์ได้');
      }
      return;
    }

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
  }, [currentUser.id, dataSource, refreshFromApi]);

  const handleSave = useCallback(async (postId: string) => {
    if (dataSource === 'api') {
      try {
        await togglePostSave(postId, currentUser.id);
        await refreshFromApi(currentUser.id);
        toast.success('อัปเดตการบันทึกโพสต์แล้ว');
      } catch (error) {
        console.error(error);
        toast.error('ไม่สามารถบันทึกโพสต์ได้');
      }
      return;
    }

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
  }, [currentUser.id, dataSource, refreshFromApi]);

  const handleComment = useCallback(async (postId: string, content: string) => {
    if (dataSource === 'api') {
      try {
        await createComment(postId, currentUser.id, content);
        await refreshFromApi(currentUser.id);
        toast.success('แสดงความคิดเห็นแล้ว');
      } catch (error) {
        console.error(error);
        toast.error('ไม่สามารถเพิ่มความคิดเห็นได้');
      }
      return;
    }

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
  }, [currentUser, dataSource, refreshFromApi]);

  const handleLikeComment = useCallback(async (postId: string, commentId: string) => {
    if (dataSource === 'api') {
      try {
        await likeComment(commentId);
        await refreshFromApi(currentUser.id);
      } catch (error) {
        console.error(error);
        toast.error('ไม่สามารถกดถูกใจความคิดเห็นได้');
      }
      return;
    }

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
  }, [currentUser.id, dataSource, refreshFromApi]);

  const handleShare = useCallback((postId: string) => {
    // Copy link to clipboard
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success('คัดลอกลิงก์แล้ว');
  }, []);

  const handleReport = useCallback(async (postId: string) => {
    if (dataSource === 'api') {
      try {
        await reportPost(postId);
        await refreshFromApi(currentUser.id);
        toast.success('รายงานโพสต์แล้ว ขอบคุณที่ช่วยรักษาคุณภาพของชุมชน');
      } catch (error) {
        console.error(error);
        toast.error('ไม่สามารถรายงานโพสต์ได้');
      }
      return;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, reports: post.reports + 1 } : post
      )
    );
    toast.success('รายงานโพสต์แล้ว ขอบคุณที่ช่วยรักษาคุณภาพของชุมชน');
  }, [currentUser.id, dataSource, refreshFromApi]);

  const handleDeletePost = useCallback(async (postId: string) => {
    if (dataSource === 'api') {
      try {
        await deletePost(postId, currentUser.id);
        setSelectedPost(null);
        await refreshFromApi(currentUser.id);
        toast.success('ลบโพสต์แล้ว');
      } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error('ไม่สามารถลบโพสต์ได้');
        }
      }
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setSelectedPost(null);
    toast.success('ลบโพสต์แล้ว');
  }, [currentUser.id, dataSource, refreshFromApi]);

  const handleCreatePost = useCallback(async (postData: {
    title: string;
    content: string;
    category: PostCategory;
    priority: PostPriority;
    targetFaculties: Faculty[];
    targetYears: number[];
    image?: string;
  }) => {
    if (dataSource === 'api') {
      try {
        const moderation = await moderatePostDraft(postData.title, postData.content);
        if (!moderation.allowed) {
          throw new Error(
            moderation.suggestedRewrite
            ? `${moderation.reason} ลองปรับเป็น: ${moderation.suggestedRewrite}`
            : moderation.reason,
          );
        }

        await createPost(currentUser.id, postData);
        await refreshFromApi(currentUser.id);
        toast.success('โพสต์สำเร็จ!');
      } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else if (error instanceof Error && error.message) {
          toast.error(error.message);
        } else {
          toast.error('ไม่สามารถสร้างโพสต์ได้');
        }
        throw error;
      }
      return;
    }

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
  }, [currentUser, dataSource, posts, refreshFromApi]);

  const handleGenerateFromImage = useCallback(async (
    image: string,
    onEvent?: Parameters<typeof streamGeneratePostFromImage>[1],
  ) => {
    try {
      const draft = onEvent
        ? await streamGeneratePostFromImage(image, onEvent)
        : await generatePostFromImage(image);
      toast.success('สร้างเนื้อหาจากภาพแล้ว');
      return draft;
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('ไม่สามารถสร้างเนื้อหาจากภาพได้');
      }
      throw error;
    }
  }, []);

  const handleTranslatePost = useCallback(async (post: Post, targetLanguage: 'th' | 'en') => {
    try {
      const translation = await translatePostContent(post.title, post.content, targetLanguage);
      toast.success(`แปลโพสต์เป็น ${targetLanguage === 'en' ? 'English' : 'ไทย'} แล้ว`);
      return translation;
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('ไม่สามารถแปลโพสต์ได้');
      }
      throw error;
    }
  }, []);

  const handleSaveProfile = useCallback(async (updatedData: Partial<User>) => {
    if (dataSource === 'api') {
      try {
        await updateUserProfile(currentUser.id, updatedData);
        await refreshFromApi(currentUser.id);
        toast.success('บันทึกโปรไฟล์แล้ว');
      } catch (error) {
        console.error(error);
        toast.error('ไม่สามารถบันทึกโปรไฟล์ได้');
      }
      return;
    }

    setCurrentUser({ ...currentUser, ...updatedData });
    toast.success('บันทึกโปรไฟล์แล้ว');
  }, [currentUser, dataSource, refreshFromApi]);

  const handleViewChange = useCallback((view: string) => {
    setCurrentView(view);
    // Reset filters when changing views
    if (view === 'saved') {
      setShowSaved(true);
      setShowMyPosts(false);
      setCurrentView('posts');
    } else if (view === 'my-posts') {
      setShowMyPosts(true);
      setShowSaved(false);
      setCurrentView('posts');
    } else {
      setShowSaved(false);
      setShowMyPosts(false);
    }
  }, []);

  const handleToggleSavedPosts = useCallback(() => {
    setCurrentView('posts');
    setShowSaved((prev) => {
      const next = !prev;
      if (next) {
        setShowMyPosts(false);
      }
      return next;
    });
  }, []);

  const handleToggleMyPosts = useCallback(() => {
    setCurrentView('posts');
    setShowMyPosts((prev) => {
      const next = !prev;
      if (next) {
        setShowSaved(false);
      }
      return next;
    });
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

  const handleMarkNotificationAsRead = useCallback(async (id: string) => {
    if (dataSource === 'api') {
      try {
        await markNotificationAsRead(id);
        await refreshFromApi(currentUser.id);
      } catch (error) {
        console.error(error);
        toast.error('ไม่สามารถอัปเดตสถานะการแจ้งเตือนได้');
      }
      return;
    }

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, [currentUser.id, dataSource, refreshFromApi]);

  const handleMarkAllNotificationsAsRead = useCallback(async () => {
    if (dataSource === 'api') {
      try {
        await markAllNotificationsAsRead(currentUser.id);
        await refreshFromApi(currentUser.id);
      } catch (error) {
        console.error(error);
        toast.error('ไม่สามารถอัปเดตการแจ้งเตือนได้');
      }
      return;
    }

    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, [currentUser.id, dataSource, refreshFromApi]);

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
        return <TeamsView currentUser={currentUser} allUsers={users} />;

      case 'settings':
        return (
          <SettingsView
            user={currentUser}
            onSave={handleSaveProfile}
            appLanguage={appLanguage}
            onAppLanguageChange={setAppLanguage}
          />
        );

      case 'resume':
        return <ResumeView currentUser={currentUser} />;

      default:
        return null;
    }
  };

  // ── Auth loading spinner ──
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-amber-900">
        <Toaster />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // ── Login page ──
  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

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
          onDelete={handleDeletePost}
          onTranslate={handleTranslatePost}
          appLanguage={appLanguage}
        />
      )}

      <>
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar
            user={currentUser}
            currentView={currentView}
            onViewChange={handleViewChange}
            showSaved={showSaved}
            showMyPosts={showMyPosts}
            onToggleSavedPosts={handleToggleSavedPosts}
            onToggleMyPosts={handleToggleMyPosts}
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
            onLogout={handleLogout}
          />

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {dataSource === 'mock' && (
                <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  API ยังไม่พร้อมใช้งาน ตอนนี้หน้าเว็บกำลังแสดงผลจาก mock data
                </div>
              )}
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
          onGenerateFromImage={handleGenerateFromImage}
        />
      </>
    </div>
  );
}

