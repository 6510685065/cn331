import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.postSave.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "student.affairs@university.ac.th",
      name: "ฝ่ายกิจการนักศึกษา",
      role: "ADMIN",
      interests: [],
      authProvider: "seed"
    }
  });

  const softwareClub = await prisma.user.create({
    data: {
      email: "seclub@university.ac.th",
      name: "ชมรมวิศวกรรมซอฟต์แวร์",
      role: "CLUB",
      faculty: "ENGINEERING",
      interests: ["programming", "technology"],
      authProvider: "seed"
    }
  });

  const studentEngineering = await prisma.user.create({
    data: {
      email: "somchai.j@university.ac.th",
      name: "สมชาย ใจดี",
      role: "STUDENT",
      faculty: "ENGINEERING",
      year: 2,
      interests: ["internship", "programming"],
      authProvider: "seed"
    }
  });

  const musicClub = await prisma.user.create({
    data: {
      email: "harmony.club@university.ac.th",
      name: "ชมรมดนตรี Harmony",
      role: "CLUB",
      faculty: "ARTS",
      interests: ["music", "performance"],
      authProvider: "seed"
    }
  });

  const studentScience = await prisma.user.create({
    data: {
      email: "somsri.r@university.ac.th",
      name: "สมศรี รักเรียน",
      role: "STUDENT",
      faculty: "SCIENCE",
      year: 3,
      interests: ["research", "science"],
      authProvider: "seed"
    }
  });

  const examPost = await prisma.post.create({
    data: {
      authorId: admin.id,
      title: "ประกาศปิดภาคการศึกษา - สอบไล่ 15-25 มี.ค. 2569",
      content:
        "แจ้งกำหนดการสอบไล่ภาคการศึกษาที่ 2/2568 ระหว่างวันที่ 15-25 มีนาคม 2569 ขอให้นักศึกษาตรวจสอบตารางสอบและเตรียมตัวให้พร้อม",
      category: "EXAM",
      priority: "EMERGENCY",
      targetFaculties: ["ENGINEERING", "SCIENCE", "ARTS", "BUSINESS", "MEDICINE", "LAW"],
      targetYears: [1, 2, 3, 4],
      isPinned: true,
      likesCount: 245,
      savesCount: 189,
      createdAt: new Date("2026-02-10T09:00:00.000Z")
    }
  });

  const workshopPost = await prisma.post.create({
    data: {
      authorId: softwareClub.id,
      title: "Workshop: Introduction to AI & Machine Learning",
      content:
        "เชิญชวนนักศึกษาทุกคณะเข้าร่วม Workshop เรียนรู้พื้นฐาน AI และ Machine Learning วันเสาร์ที่ 15 ก.พ. เวลา 13:00-17:00 น. ห้อง EN-405 มีใบ certificate และของว่างด้วยนะครับ! ลงทะเบียนฟรี จำนวนจำกัด 50 ที่นั่ง",
      category: "EVENT",
      priority: "HIGH",
      targetFaculties: ["ENGINEERING", "SCIENCE"],
      targetYears: [2, 3, 4],
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
      likesCount: 156,
      savesCount: 98,
      commentsCount: 1,
      createdAt: new Date("2026-02-09T14:30:00.000Z")
    }
  });

  const internshipPost = await prisma.post.create({
    data: {
      authorId: studentEngineering.id,
      title: "หา Internship ด้าน Software Development (Summer 2026)",
      content:
        "มีใครรู้จักบริษัทที่เปิดรับ Intern ด้าน Software Development ช่วงปิดเทอมนี้บ้างครับ? ผมเป็นวิศวะปี 2 อยากหาประสบการณ์เพิ่ม มีทักษะ React, Node.js, Python",
      category: "INTERNSHIP",
      priority: "NORMAL",
      targetFaculties: ["ENGINEERING"],
      targetYears: [2, 3],
      likesCount: 89,
      savesCount: 67,
      commentsCount: 1,
      createdAt: new Date("2026-02-08T16:20:00.000Z")
    }
  });

  const concertPost = await prisma.post.create({
    data: {
      authorId: musicClub.id,
      title: 'Harmony Concert 2026 - "Melodies of Youth"',
      content:
        'ชมรมดนตรี Harmony ขอเชิญชวนทุกท่านเข้าชมคอนเสิร์ตประจำปี "Melodies of Youth" วันศุกร์ที่ 21 ก.พ. เวลา 18:00 น. หอประชุมใหญ่ มีการแสดงจากวงดนตรีนักศึกษา 10 วง บัตรราคา 100 บาท (รายได้มอบให้มูลนิธิเด็ก)',
      category: "EVENT",
      priority: "HIGH",
      targetFaculties: ["ARTS", "ENGINEERING", "SCIENCE", "BUSINESS"],
      targetYears: [1, 2, 3, 4],
      imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
      likesCount: 312,
      savesCount: 145,
      createdAt: new Date("2026-02-07T11:00:00.000Z")
    }
  });

  const scholarshipPost = await prisma.post.create({
    data: {
      authorId: admin.id,
      title: "ประกาศเปิดรับสมัครทุนการศึกษา ประจำปี 2569",
      content:
        "มหาวิทยาลัยเปิดรับสมัครทุนการศึกษาสำหรับนักศึกษาที่มีผลการเรียนดี GPAX ≥ 3.50 และนักศึกษาที่ขาดแคลนทุนทรัพย์ สมัครได้ตั้งแต่วันนี้ - 28 ก.พ. 2569 ผ่านระบบออนไลน์",
      category: "ANNOUNCEMENT",
      priority: "HIGH",
      targetFaculties: ["ENGINEERING", "SCIENCE", "ARTS", "BUSINESS", "MEDICINE", "LAW"],
      targetYears: [1, 2, 3, 4],
      isPinned: true,
      likesCount: 423,
      savesCount: 298,
      createdAt: new Date("2026-02-06T10:00:00.000Z")
    }
  });

  const researchPost = await prisma.post.create({
    data: {
      authorId: studentScience.id,
      title: "หาเพื่อนร่วมทำโปรเจกต์วิจัย - Environmental Science",
      content:
        'กำลังหาเพื่อนร่วมทำวิจัยเรื่อง "Impact of Plastic Waste on Marine Life" มี 2 ที่นั่งครับ ต้องการคนที่สนใจด้านสิ่งแวดล้อม มีเวลาทำวิจัยในช่วงปิดเทอม',
      category: "GENERAL",
      priority: "NORMAL",
      targetFaculties: ["SCIENCE"],
      targetYears: [3, 4],
      likesCount: 45,
      savesCount: 23,
      createdAt: new Date("2026-02-05T13:45:00.000Z")
    }
  });

  await prisma.comment.createMany({
    data: [
      {
        postId: workshopPost.id,
        authorId: studentEngineering.id,
        content: "สนใจมากเลยครับ! ลงทะเบียนยังไงครับ",
        likesCount: 12,
        createdAt: new Date("2026-02-09T15:00:00.000Z")
      },
      {
        postId: internshipPost.id,
        authorId: studentScience.id,
        content: "ลอง apply ที่ SCB Tech ดูครับ เปิดรับน่าจะถึงปลายเดือนนี้",
        likesCount: 23,
        createdAt: new Date("2026-02-08T17:00:00.000Z")
      }
    ]
  });

  await prisma.postLike.createMany({
    data: [
      { postId: examPost.id, userId: studentEngineering.id },
      { postId: workshopPost.id, userId: studentEngineering.id }
    ]
  });

  await prisma.postSave.createMany({
    data: [
      { postId: examPost.id, userId: studentEngineering.id },
      { postId: workshopPost.id, userId: studentEngineering.id }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        recipientId: studentEngineering.id,
        actorId: softwareClub.id,
        postId: workshopPost.id,
        type: "EVENT",
        title: "Workshop AI & ML",
        message: "ชมรมวิศวกรรมซอฟต์แวร์โพสต์กิจกรรมใหม่",
        isRead: false,
        createdAt: new Date("2026-03-11T10:30:00.000Z")
      },
      {
        recipientId: studentEngineering.id,
        actorId: admin.id,
        postId: examPost.id,
        type: "EXAM",
        title: "ประกาศสอบไล่",
        message: "ฝ่ายกิจการนักศึกษาประกาศสำคัญ",
        isRead: false,
        createdAt: new Date("2026-03-11T09:00:00.000Z")
      },
      {
        recipientId: studentEngineering.id,
        actorId: studentScience.id,
        postId: internshipPost.id,
        type: "COMMENT",
        title: "ความคิดเห็นใหม่",
        message: "มีคนตอบกลับโพสต์ของคุณ",
        isRead: true,
        createdAt: new Date("2026-03-10T16:45:00.000Z")
      },
      {
        recipientId: studentEngineering.id,
        actorId: admin.id,
        postId: scholarshipPost.id,
        type: "ANNOUNCEMENT",
        title: "ทุนการศึกษา 2569",
        message: "เปิดรับสมัครทุนการศึกษาประจำปี",
        isRead: true,
        createdAt: new Date("2026-03-10T10:00:00.000Z")
      },
      {
        recipientId: studentEngineering.id,
        actorId: musicClub.id,
        postId: concertPost.id,
        type: "EVENT",
        title: "Harmony Concert 2026",
        message: "ชมรมดนตรีเชิญชมคอนเสิร์ตประจำปี",
        isRead: true,
        createdAt: new Date("2026-03-09T14:20:00.000Z")
      }
    ]
  });

  console.log("Seeded users, posts, comments, likes, saves, and notifications.");
  console.log({
    users: 5,
    posts: 6,
    comments: 2,
    likes: 2,
    saves: 2,
    notifications: 5
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
