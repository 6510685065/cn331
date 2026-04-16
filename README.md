# Smart Campus Community Platform

เว็บแอป community platform สำหรับมหาวิทยาลัย ที่เริ่มจาก frontend prototype และถูกพัฒนาต่อให้มีฐานข้อมูลจริง, ระบบโพสต์ที่เขียนกลับลง database, และ local AI features ผ่าน Ollama

README นี้เขียนสำหรับคนที่จะ clone โปรเจคไปแล้ว **ตั้งระบบใหม่บนเครื่องตัวเอง** เพื่อพัฒนาต่อ

## Overview

ปัจจุบันโปรเจครองรับฟีเจอร์หลักเหล่านี้:

- ดู feed โพสต์
- สร้างโพสต์
- ลบโพสต์ของตัวเอง
- like / save / comment / report
- filter แบบ `Saved` และ `My Posts`
- แก้ไขข้อมูลโปรไฟล์
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
    App.tsx                  # app state และ handler หลัก
    components/              # UI components
    lib/bootstrap.ts         # frontend -> backend API helpers
    data/mockData.ts         # fallback mock data
    types/index.ts           # frontend types

server/
  index.mjs                  # Express API server
  contentFilter.mjs          # rule-based moderation

prisma/
  schema.prisma              # database schema
  seed.mjs                   # development seed data
```

ไฟล์สำคัญที่ควรรู้ก่อนแก้:

- [src/app/App.tsx](./src/app/App.tsx)
- [src/app/lib/bootstrap.ts](./src/app/lib/bootstrap.ts)
- [server/index.mjs](./server/index.mjs)
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

สร้าง `.env` จาก `.env.example`

```powershell
Copy-Item .env.example .env
```

ตัวอย่างค่าใน `.env`

```env
DATABASE_URL="postgresql://cn331_user:1234@localhost:5432/cn331_smart_campus?schema=public"
OLLAMA_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="qwen2.5vl:7b"
APP_DEFAULT_LANGUAGE="th"
```

คำอธิบาย:

- `DATABASE_URL`: ใช้เชื่อม PostgreSQL
- `OLLAMA_URL`: URL ของ Ollama server
- `OLLAMA_MODEL`: ชื่อ model ที่ใช้กับฟีเจอร์ AI
- `APP_DEFAULT_LANGUAGE`: ภาษาเริ่มต้นสำหรับการแปล

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

### Database-backed features

- โหลด users / posts / notifications จาก PostgreSQL
- create post
- delete own post
- like post
- save post
- comment
- like comment
- report post
- update profile
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

### 1. Authentication

ตอนนี้ยังไม่มี login จริง ควรเพิ่ม:

- local auth ชั่วคราว
- session handling
- หรือเตรียมต่อ university login ภายหลัง

### 2. Role Permissions

ควรเพิ่ม permission checks ให้ละเอียดขึ้น เช่น:

- admin-only actions
- club actions
- ownership checks เพิ่มเติม

### 3. Resume Persistence

หน้า resume ยังไม่เชื่อม database จริง

### 4. Calendar Data Model

ตอนนี้ calendar อิงจากโพสต์หมวด event/exam เป็นหลัก  
ถ้าจะพัฒนาต่อ ควรแยก field เช่น:

- eventDate
- endDate
- location

### 5. Backend Refactor

ตอนนี้ backend ยังรวมอยู่ในไฟล์เดียวเป็นหลัก  
ถ้าจะเติบโตต่อ แนะนำแยกเป็น:

- routes
- services
- validation
- db access layer

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

### หน้าเว็บขึ้น mock data

แปลว่า frontend เรียก backend หรือ database ไม่สำเร็จ  
ให้ตรวจ:

- API รันอยู่ไหม
- database connect ได้ไหม
- `http://127.0.0.1:3001/api/health` ตอบ `{"ok":true}` หรือไม่

## Notes For Contributors

- โปรเจคนี้เริ่มจาก prototype จึงยังมีโครงสร้างบางส่วนที่เป็นลักษณะ frontend-first
- ถ้าจะแก้ flow หลัก ควรดูทั้งฝั่ง `App.tsx`, `bootstrap.ts`, และ `server/index.mjs`
- อย่า commit `.env` หรือ secret ใด ๆ
- ถ้าจะเพิ่ม AI features ใหม่ ควรระวังเรื่อง latency และ resource ของเครื่องที่รัน Ollama

## Recommended Next Tasks

งานที่เหมาะสำหรับพัฒนาต่อ:

1. เพิ่ม auth จริง
2. เพิ่ม current user switch สำหรับ dev
3. แยก backend structure
4. ทำ resume ให้เขียนลง DB
5. เพิ่ม event schema ให้ calendar
6. เพิ่ม mobile UX และ state label ให้ชัดขึ้น

