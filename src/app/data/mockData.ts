import { User, Post, Faculty, PostCategory, PostPriority } from '../types';
import { Notification } from '../components/NotificationPanel';

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'ฝ่ายกิจการนักศึกษา',
    email: 'student.affairs@university.ac.th',
    role: 'admin',
    interests: [],
    avatar: undefined
  },
  {
    id: 'club-1',
    name: 'ชมรมวิศวกรรมซอฟต์แวร์',
    email: 'seclub@university.ac.th',
    role: 'club',
    faculty: 'engineering',
    interests: ['programming', 'technology'],
    avatar: undefined
  },
  {
    id: 'student-1',
    name: 'สมชาย ใจดี',
    email: 'somchai.j@university.ac.th',
    role: 'student',
    faculty: 'engineering',
    year: 2,
    interests: ['internship', 'programming'],
    avatar: undefined
  },
  {
    id: 'club-2',
    name: 'ชมรมดนตรี Harmony',
    email: 'harmony.club@university.ac.th',
    role: 'club',
    faculty: 'arts',
    interests: ['music', 'performance'],
    avatar: undefined
  },
  {
    id: 'student-2',
    name: 'สมศรี รักเรียน',
    email: 'somsri.r@university.ac.th',
    role: 'student',
    faculty: 'science',
    year: 3,
    interests: ['research', 'science'],
    avatar: undefined
  }
];

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    author: mockUsers[0], // Admin
    title: '⚠️ ประกาศปิดภาคการศึกษา - สอบไล่ 15-25 มี.ค. 2569',
    content: 'แจ้งกำหนดการสอบไล่ภาคการศึกษาที่ 2/2568 ระหว่างวันที่ 15-25 มีนาคม 2569 ขอให้นักศึกษาตรวจสอบตารางสอบและเตรียมตัวให้พร้อม',
    category: 'exam',
    priority: 'emergency',
    targetFaculties: ['engineering', 'science', 'arts', 'business', 'medicine', 'law'],
    targetYears: [1, 2, 3, 4],
    createdAt: new Date('2026-02-10T09:00:00'),
    likes: 245,
    comments: [],
    saves: 189,
    reports: 0,
    isPinned: true,
    likedBy: ['student-1'],
    savedBy: ['student-1']
  },
  {
    id: 'post-2',
    author: mockUsers[1], // Software Engineering Club
    title: 'Workshop: Introduction to AI & Machine Learning',
    content: 'เชิญชวนนักศึกษาทุกคณะเข้าร่วม Workshop เรียนรู้พื้นฐาน AI และ Machine Learning วันเสาร์ที่ 15 ก.พ. เวลา 13:00-17:00 น. ห้อง EN-405 มีใบ certificate และของว่าง��ห้ด้วยนะครับ! ลงทะเบียนฟรี จำนวนจำกัด 50 ที่นั่ง',
    category: 'event',
    priority: 'high',
    targetFaculties: ['engineering', 'science'],
    targetYears: [2, 3, 4],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    createdAt: new Date('2026-02-09T14:30:00'),
    likes: 156,
    comments: [
      {
        id: 'comment-1',
        author: mockUsers[2],
        content: 'สนใจมากเลยครับ! ลงทะเบียนยังไงครับ',
        createdAt: new Date('2026-02-09T15:00:00'),
        likes: 12
      }
    ],
    saves: 98,
    reports: 0,
    isPinned: false,
    likedBy: ['student-1'],
    savedBy: ['student-1']
  },
  {
    id: 'post-3',
    author: mockUsers[2], // Student
    title: '🔍 หา Internship ด้าน Software Development (Summer 2026)',
    content: 'มีใครรู้จักบริษัทที่เปิดรับ Intern ด้าน Software Development ช่วงปิดเทอมนี้บ้างครับ? ผมเป็นวิศวะปี 2 อยากหาประสบการณ์เพิ่ม มีทักษะ React, Node.js, Python',
    category: 'internship',
    priority: 'normal',
    targetFaculties: ['engineering'],
    targetYears: [2, 3],
    createdAt: new Date('2026-02-08T16:20:00'),
    likes: 89,
    comments: [
      {
        id: 'comment-2',
        author: mockUsers[4],
        content: 'ลอง apply ที่ SCB Tech ดูครับ เปิดรับน่าจะถึงปลายเดือนนี้',
        createdAt: new Date('2026-02-08T17:00:00'),
        likes: 23
      }
    ],
    saves: 67,
    reports: 0,
    isPinned: false,
    likedBy: [],
    savedBy: []
  },
  {
    id: 'post-4',
    author: mockUsers[3], // Music Club
    title: '🎵 Harmony Concert 2026 - "Melodies of Youth"',
    content: 'ชมรมดนตรี Harmony ขอเชิญชวนทุกท่านเข้าชมคอนเสิร์ตประจำปี "Melodies of Youth" วันศุกร์ที่ 21 ก.พ. เวลา 18:00 น. หอประชุมใหญ่ มีการแสดงจากวงดนตรีนักศึกษา 10 วง บัตรราคา 100 บาท (รายได้มอบให้มูลนิธิเด็ก)',
    category: 'event',
    priority: 'high',
    targetFaculties: ['arts', 'engineering', 'science', 'business'],
    targetYears: [1, 2, 3, 4],
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
    createdAt: new Date('2026-02-07T11:00:00'),
    likes: 312,
    comments: [],
    saves: 145,
    reports: 0,
    isPinned: false,
    likedBy: [],
    savedBy: []
  },
  {
    id: 'post-5',
    author: mockUsers[0], // Admin
    title: 'ประกาศเปิดรับสมัครทุนการศึกษา ประจำปี 2569',
    content: 'มหาวิทยาลัยเปิดรับสมัครทุนการศึกษาสำหรับนักศึกษาที่มีผลการเรียนดี GPAX ≥ 3.50 และนักศึกษาที่ขาดแคลนทุนทรัพย์ สมัครได้ตั้งแต่วันนี้ - 28 ก.พ. 2569 ผ่านระบบออนไลน์',
    category: 'announcement',
    priority: 'high',
    targetFaculties: ['engineering', 'science', 'arts', 'business', 'medicine', 'law'],
    targetYears: [1, 2, 3, 4],
    createdAt: new Date('2026-02-06T10:00:00'),
    likes: 423,
    comments: [],
    saves: 298,
    reports: 0,
    isPinned: true,
    likedBy: [],
    savedBy: []
  },
  {
    id: 'post-6',
    author: mockUsers[4], // Science Student
    title: 'หาเพื่อนร่วมทำโปรเจกต์วิจัย - Environmental Science',
    content: 'กำลังหาเพื่อนร่วมทำวิจัยเรื่อง "Impact of Plastic Waste on Marine Life" มี 2 ที่นั่งครับ ต้องการคนที่สนใจด้านสิ่งแวดล้อม มีเวลาทำวิจัยในช่วงปิดเทอม ติดต่อ Line: somsi_sci',
    category: 'general',
    priority: 'normal',
    targetFaculties: ['science'],
    targetYears: [3, 4],
    createdAt: new Date('2026-02-05T13:45:00'),
    likes: 45,
    comments: [],
    saves: 23,
    reports: 0,
    isPinned: false,
    likedBy: [],
    savedBy: []
  }
];

export const faculties: { value: Faculty; label: string }[] = [
  { value: 'engineering', label: 'วิศวกรรมศาสตร์' },
  { value: 'science', label: 'วิทยาศาสตร์' },
  { value: 'arts', label: 'ศิลปศาสตร์' },
  { value: 'business', label: 'บริหารธุรกิจ' },
  { value: 'medicine', label: 'แพทยศาสตร์' },
  { value: 'law', label: 'นิติศาสตร์' }
];

export const categories: { value: PostCategory; label: string; icon: string }[] = [
  { value: 'exam', label: 'ข่าวสอบ', icon: '📝' },
  { value: 'event', label: 'กิจกรรม', icon: '🎉' },
  { value: 'internship', label: 'Internship', icon: '💼' },
  { value: 'announcement', label: 'ประกาศ', icon: '📢' },
  { value: 'club', label: 'ชมรม', icon: '🎯' },
  { value: 'general', label: 'ทั่วไป', icon: '💬' }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'event',
    title: 'Workshop AI & ML',
    message: 'ชมรมวิศวกรรมซอฟต์แวร์โพสต์กิจกรรมใหม่',
    timestamp: new Date('2026-03-11T10:30:00'),
    isRead: false,
    postId: 'post-2'
  },
  {
    id: 'notif-2',
    type: 'exam',
    title: 'ประกาศสอบไล่',
    message: 'ฝ่ายกิจการนักศึกษาประกาศสำคัญ',
    timestamp: new Date('2026-03-11T09:00:00'),
    isRead: false,
    postId: 'post-1'
  },
  {
    id: 'notif-3',
    type: 'comment',
    title: 'ความคิดเห็นใหม่',
    message: 'มีคนตอบกลับโพสต์ของคุณ',
    timestamp: new Date('2026-03-10T16:45:00'),
    isRead: true,
    postId: 'post-3'
  },
  {
    id: 'notif-4',
    type: 'announcement',
    title: 'ทุนการศึกษา 2569',
    message: 'เปิดรับสมัครทุนการศึกษาประจำปี',
    timestamp: new Date('2026-03-10T10:00:00'),
    isRead: true,
    postId: 'post-5'
  },
  {
    id: 'notif-5',
    type: 'event',
    title: 'Harmony Concert 2026',
    message: 'ชมรมดนตรีเชิญชมคอนเสิร์ตประจำปี',
    timestamp: new Date('2026-03-09T14:20:00'),
    isRead: true,
    postId: 'post-4'
  }
];