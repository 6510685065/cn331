export type UserRole = 'student' | 'club' | 'admin';

export type Faculty = 'engineering' | 'science' | 'arts' | 'business' | 'medicine' | 'law';

export type PostPriority = 'emergency' | 'high' | 'normal';

export type PostCategory = 'exam' | 'event' | 'internship' | 'announcement' | 'club' | 'general';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faculty?: Faculty;
  year?: number;
  interests: string[];
  avatar?: string;
}

export interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  category: PostCategory;
  priority: PostPriority;
  targetFaculties: Faculty[];
  targetYears: number[];
  image?: string;
  createdAt: Date;
  likes: number;
  comments: Comment[];
  saves: number;
  reports: number;
  isPinned: boolean;
  likedBy: string[];
  savedBy: string[];
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
  likes: number;
}
