# Smart Campus Community Platform

เว็บแอป community platform สำหรับมหาวิทยาลัย ที่เริ่มจาก frontend prototype และถูกพัฒนาต่อให้มีฐานข้อมูลจริง, ระบบโพสต์ที่เขียนกลับลง database, ระบบล็อกอินผ่าน TU API และ local AI features ผ่าน Ollama

README นี้เขียนสำหรับคนที่จะ clone โปรเจคไปแล้ว **ตั้งระบบใหม่บนเครื่องตัวเอง** เพื่อพัฒนาต่อ

## Overview

ปัจจุบันโปรเจครองรับฟีเจอร์หลักเหล่านี้:

- **Authentication ผ่าน TU API:** ล็อกอินด้วยบัญชีมหาวิทยาลัยธรรมศาสตร์ พร้อมจัดการ JWT Session และแบ่ง Role อัตโนมัติ (STUDENT / PROFESSOR / ADMIN)
- ดู feed โพสต์
- สร้างโพสต์
- ลบโพสต์ของตัวเอง
- like / save / comment / report
- filter แบบ `Saved` และ `My Posts`
- แก้ไขข้อมูลโปรไฟล์ (และหน้า Resume ที่อิงจากข้อมูลจริง)
- notifications
- local AI ผ่าน Ollama สำหรับ
  - สร้างเนื้อหาโพสต์จากรูป
  - moderation ก่อนโพสต์
  - แปลโพสต์ไทย/อังกฤษ

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Express
- Prisma
- PostgreSQL
- jsonwebtoken (JWT Auth)
- Ollama

## Requirements

ก่อนเริ่ม ควรมีสิ่งนี้บนเครื่อง:

- Node.js 18+ หรือใหม่กว่า
- npm
- PostgreSQL
- Ollama
- Git

## Project Structure

```text
src/
  app/
    App.tsx                  # app state, Auth Gate และ handler หลัก
    components/              # UI components
    lib/
      bootstrap.ts           # frontend -> backend API helpers
      auth.ts                # จัดการ auth token ฝั่ง client
    types/index.ts           # frontend types

server/
  index.mjs                  # Express API server หลัก
  auth.mjs                   # จัดการ TU API Auth, Role Mapping, JWT
  contentFilter.mjs          # rule-based moderation

prisma/
  schema.prisma              # database schema
  seed.mjs                   # development seed data
```

ไฟล์สำคัญที่ควรรู้ก่อนแก้:

- [src/app/App.tsx](./src/app/App.tsx)
- [src/app/lib/bootstrap.ts](./src/app/lib/bootstrap.ts)
- [server/index.mjs](./server/index.mjs)
- [server/auth.mjs](./server/auth.mjs)
- [server/contentFilter.mjs](./server/contentFilter.mjs)
- [prisma/schema.prisma](./prisma/schema.prisma)
- [prisma/seed.mjs](./prisma/seed.mjs)

## 1. Clone The Project

```powershell
git clone <repo-url>
cd cn331
```

## 2. Install Dependencies

```powershell
npm install
```

## 3. Create Environment File

สร้าง `.env` จาก `.env.example` (ถ้ามี) หรือสร้างไฟล์ `.env` ใหม่ด้วยตัวเอง

```powershell
Copy-Item .env.example .env
```

ตัวอย่างค่าใน `.env`

```env
DATABASE_URL="postgresql://cn331_user:1234@localhost:5432/cn331_smart_campus?schema=public"
OLLAMA_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="qwen2.5vl:7b"
APP_DEFAULT_LANGUAGE="th"

# TU API Authentication
TU_API_KEY=YOUR_TU_API_KEY_HERE
JWT_SECRET=your-secure-jwt-secret
ADMIN_EMAILS=your.email@dome.tu.ac.th
```

คำอธิบาย:

- `DATABASE_URL`: ใช้เชื่อม PostgreSQL
- `OLLAMA_URL`: URL ของ Ollama server
- `OLLAMA_MODEL`: ชื่อ model ที่ใช้กับฟีเจอร์ AI
- `APP_DEFAULT_LANGUAGE`: ภาษาเริ่มต้นสำหรับการแปล
- `TU_API_KEY`: คีย์สำหรับยืนยันตัวตนกับ TU API (สร้างได้จาก https://restapi.tu.ac.th/home/)
- `JWT_SECRET`: Secret key สำหรับเข้ารหัส Session ของระบบเราเอง
- `ADMIN_EMAILS`: อีเมล (@dome.tu.ac.th) ที่จะได้สิทธิ์ ADMIN ทันทีเมื่อล็อกอิน (คั่นด้วยลูกน้ำได้)

## 4. Create A New PostgreSQL Database

โปรเจคนี้ไม่ได้แถม database จริงมาด้วย ดังนั้นคนที่เอาไปพัฒนาต่อต้อง **สร้าง database ใหม่บนเครื่องตัวเอง**

แนะนำให้สร้าง:

- database: `cn331_smart_campus`
- user: `cn331_user`

จากนั้นให้ใส่ค่าจริงลงใน `.env`

## 5. Initialize The Database

รันคำสั่งนี้ตามลำดับ:

```powershell
npm run db:generate
npm run db:push
npm run db:seed
```

คำสั่งแต่ละตัว:

- `db:generate` สร้าง Prisma client
- `db:push` สร้างตารางตาม schema ลง PostgreSQL
- `db:seed` ใส่ข้อมูลตัวอย่างสำหรับใช้พัฒนาต่อ

ถ้าต้องการดูข้อมูลใน database:

```powershell
npm run db:studio
```

## 6. Install And Prepare Ollama

ถ้าต้องการใช้ฟีเจอร์ AI ให้ติดตั้ง Ollama ก่อน

ดาวน์โหลด:

- Windows: https://ollama.com/download/windows

หลังติดตั้งแล้ว ให้เปิด terminal ใหม่ แล้วรัน:

```powershell
ollama pull qwen2.5vl:7b
```

เช็กว่า model พร้อม:

```powershell
ollama list
```

ควรเห็น:

```text
qwen2.5vl:7b
```

หมายเหตุ:

- โมเดลไม่ได้อยู่ใน repo
- ถ้าคนอื่น clone โปรเจคไป ก็ต้องติดตั้ง Ollama และ pull model เอง

## 7. Run The Project

รันทั้ง frontend และ backend พร้อมกัน:

```powershell
npm run dev
```

โดยปกติจะได้:

- frontend: `http://localhost:5173`
- api: `http://127.0.0.1:3001`

## Available Commands

```powershell
npm run dev
npm run build
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Development Workflow

ถ้าคนใหม่มารับโปรเจคนี้ไปพัฒนาต่อ แนะนำ flow นี้:

1. clone repo
2. `npm install`
3. สร้าง `.env`
4. สร้าง PostgreSQL database ใหม่
5. รัน `db:generate`, `db:push`, `db:seed`
6. ติดตั้ง Ollama และ pull model
7. รัน `npm run dev`

## Existing Features

### Authentication & Role System

- เชื่อมต่อ TU API จริงเพื่อยืนยันตัวตน (`restapi.tu.ac.th`)
- ดึงข้อมูลชื่อ, อีเมล, และ Faculty ของนักศึกษาและบุคลากรอัตโนมัติ
- แบ่ง Role: `STUDENT`, `PROFESSOR` (อิงจาก employee type), และ `ADMIN` (อิงจาก `.env`)
- (สำหรับนักพัฒนา) มีระบบ Backdoor เพื่อทดสอบ Role พิมพ์ Username: `mock_student`, `mock_professor`, `mock_admin` หรือ `mock_club`

### Database-backed features

- โหลด users / posts / notifications จาก PostgreSQL แบบเรียลไทม์
- create post
- delete own post
- like post
- save post
- comment
- like comment
- report post
- update profile / resume
- mark notification as read

### AI features

- generate post draft from image
- moderation ก่อนโพสต์
- Thai/English translation
- streaming status ตอน AI generate จากภาพ

## AI Notes

ระบบ AI ตอนนี้เป็น local-first ผ่าน Ollama

### Generate from image

ใช้รูปจากผู้ใช้ แล้วให้ AI ช่วยสร้าง:

- title
- content
- category
- priority
- target faculties / years

### Moderation

ตอนกดโพสต์ ระบบจะตรวจ 2 ชั้น:

1. rule-based filter จาก [server/contentFilter.mjs](./server/contentFilter.mjs)
2. AI moderation จาก Ollama

### Translation

ใช้ model เดียวกันแปลโพสต์ตามภาษาหลักของแอป

## Where To Continue Developing

ถ้าจะพัฒนาต่อ แนะนำลำดับนี้:

### 1. Role Permissions & Club Accounts

ตอนนี้ระบบแบ่ง Role เบื้องต้นแล้ว แต่ควรเพิ่ม permission checks ให้ละเอียดขึ้น:
- จำกัดการเข้าถึงหน้า Settings ของแอดมิน (Admin Dashboard)
- จัดการ Flow สำหรับผู้ใช้ประเภท `CLUB` (เนื่องจาก TU API ไม่มีสถานะนี้ อาจต้องให้แอดมินสร้างให้)

### 2. Resume Persistence
หน้า resume ดึงข้อมูลจริงของผู้ใช้ (ชื่อ, คณะ, อีเมล) มาแสดงผลแล้ว แต่ส่วนอื่น (ประสบการณ์, ทักษะ) ยังไม่ได้เชื่อมให้เซฟลง Database จริงๆ ควรสร้าง Schema มารองรับ Resume โดยเฉพาะ

### 3. Calendar Data Model
ตอนนี้ calendar อิงจากโพสต์หมวด event/exam เป็นหลัก  
ถ้าจะพัฒนาต่อ ควรแยก field เช่น `eventDate`, `endDate`, `location` ให้ชัดเจนในตาราง `Post`

### 4. Backend Refactor
ตอนนี้ backend ยังเริ่มยาวในไฟล์ `server/index.mjs`  
ถ้าฟีเจอร์เริ่มเยอะ แนะนำแยกเป็น:
- routes/
- controllers/
- services/
- middlewares/ (เรามี `authMiddleware` แล้ว)

## Troubleshooting

### `ollama is not recognized`

แปลว่า Ollama ยังไม่ได้ติดตั้ง หรือ terminal ยังไม่ refresh PATH

ให้:

1. ติดตั้ง Ollama
2. ปิด terminal
3. เปิดใหม่
4. รัน

```powershell
ollama --version
```

### `model 'qwen2.5vl:7b' not found`

ให้ pull model ก่อน:

```powershell
ollama pull qwen2.5vl:7b
```

### Prisma connection error

ให้เช็ก:

- PostgreSQL เปิดอยู่ไหม
- `DATABASE_URL` ถูกไหม
- database ถูกสร้างแล้วหรือยัง

จากนั้นลอง:

```powershell
npm run db:push
```

### ล็อกอินเข้าไม่ได้ (TU API)

- ให้ตรวจสอบว่าคุณใส่ `TU_API_KEY` ใน `.env` ถูกต้อง
- หากขึ้นว่า `"Users or Password Invalid!"` แปลว่าเซิร์ฟเวอร์ต่อกับระบบ TU ได้แล้ว แต่รหัสนักศึกษา/รหัสผ่านที่คุณใส่ไม่ถูกต้อง
- **ทางลัดสำหรับทดสอบ:** พิมพ์ Username เป็น `mock_admin` (หรือ role อื่น) แล้วกดล็อกอินเพื่อเข้าใช้งานโดยไม่ต้องใช้รหัสผ่านจริง

## Notes For Contributors

- โปรเจคนี้เริ่มจาก prototype จึงยังมีโครงสร้างบางส่วนที่เป็นลักษณะ frontend-first
- ถ้าจะแก้ flow หลัก ควรดูทั้งฝั่ง `App.tsx`, `bootstrap.ts`, `server/auth.mjs`, และ `server/index.mjs`
- อย่า commit `.env` หรือ secret ใด ๆ โดยเฉพาะ `JWT_SECRET` และ `TU_API_KEY`

## Recommended Next Tasks

งานที่เหมาะสำหรับพัฒนาต่อ:

1. เพิ่ม auth จริง
2. เพิ่ม current user switch สำหรับ dev
3. แยก backend structure
4. ทำ resume ให้เขียนลง DB
5. เพิ่ม event schema ให้ calendar
6. เพิ่ม mobile UX และ state label ให้ชัดขึ้น