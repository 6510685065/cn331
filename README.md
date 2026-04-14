# Smart Campus Community Platform

เว็บแอป community platform สำหรับมหาวิทยาลัยที่เริ่มต้นจาก frontend prototype และถูกพัฒนาต่อให้มีฐานข้อมูลจริง, workflow การโพสต์จริง, และ local AI features ผ่าน Ollama

โปรเจคนี้เหมาะสำหรับใช้เป็นฐานในการพัฒนาต่อทั้งด้าน:

- full-stack web application
- campus social/community platform
- recommendation and moderation workflows
- AI-assisted content tools

## Current Scope

ตอนนี้ระบบรองรับแล้วในระดับ development:

- feed โพสต์
- สร้างโพสต์
- like / save / comment / report
- ลบโพสต์ของตัวเอง
- saved posts / my posts filter
- profile update
- notifications
- PostgreSQL + Prisma
- local AI ผ่าน Ollama สำหรับ:
  - generate เนื้อหาโพสต์จากภาพ
  - moderation ก่อนโพสต์
  - แปลโพสต์ ไทย <-> อังกฤษ

ยังมีบางส่วนที่ยังเป็นงานต่อยอด:

- login จริง
- university SSO / API login
- role permission ที่ละเอียดขึ้น
- resume persistence
- calendar ที่มี event date จริง
- production deployment

## Tech Stack

- React
- Vite
- TypeScript
- Tailwind
- Express
- Prisma
- PostgreSQL
- Ollama

## Project Structure

โครงสร้างหลักของโปรเจค:

```text
src/
  app/
    App.tsx                  # state หลักของแอป
    components/              # UI components
    data/mockData.ts         # mock data fallback
    lib/bootstrap.ts         # frontend -> backend API helpers
    types/index.ts           # shared frontend types

server/
  index.mjs                  # Express API server
  contentFilter.mjs          # rule-based content moderation

prisma/
  schema.prisma              # database schema
  seed.mjs                   # seed data
```

ถ้าจะพัฒนาต่อ จุดที่ควรรู้ก่อน:

- [src/app/App.tsx](./src/app/App.tsx): รวม state หลัก, filters, routing แบบง่าย, และ handlers ต่าง ๆ
- [src/app/lib/bootstrap.ts](./src/app/lib/bootstrap.ts): ฟังก์ชันเรียก API จาก frontend
- [server/index.mjs](./server/index.mjs): backend routes และ AI/Ollama integration
- [server/contentFilter.mjs](./server/contentFilter.mjs): ลิสต์คำหยาบ, spam, และคำไม่เหมาะสม
- [prisma/schema.prisma](./prisma/schema.prisma): ตารางทั้งหมดของระบบ

## Requirements

ก่อนเริ่ม ให้เตรียม:

- Node.js 18+ หรือใหม่กว่า
- npm
- PostgreSQL
- Ollama

## 1. Clone And Install

```powershell
git clone <your-repo-url>
cd cn331
npm install
```

## 2. Environment Setup

สร้างไฟล์ `.env` จาก template:

```powershell
Copy-Item .env.example .env
```

ตัวอย่างค่าใน `.env`:

```env
DATABASE_URL="postgresql://cn331_user:1234@localhost:5432/cn331_smart_campus?schema=public"
OLLAMA_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="qwen2.5vl:7b"
APP_DEFAULT_LANGUAGE="th"
```

ความหมาย:

- `DATABASE_URL`: ใช้เชื่อม PostgreSQL
- `OLLAMA_URL`: URL ของ Ollama server
- `OLLAMA_MODEL`: model ที่จะใช้กับฟีเจอร์ AI
- `APP_DEFAULT_LANGUAGE`: ค่าเริ่มต้นสำหรับการแปลภาษา

## 3. PostgreSQL Setup

ถ้ามี PostgreSQL อยู่แล้ว ให้สร้าง database ใหม่สำหรับโปรเจคนี้โดยเฉพาะ

ตัวอย่าง:

- database: `cn331_smart_campus`
- user: `cn331_user`

จากนั้นรัน:

```powershell
npm run db:generate
npm run db:push
npm run db:seed
```

คำสั่งเหล่านี้ทำอะไร:

- `db:generate` สร้าง Prisma client
- `db:push` sync schema ลง database
- `db:seed` ใส่ข้อมูลตัวอย่าง

ถ้าอยากเปิดดูข้อมูล:

```powershell
npm run db:studio
```

## 4. Ollama Setup

ติดตั้ง Ollama บนเครื่อง:

- Windows: https://ollama.com/download/windows

จากนั้นโหลดโมเดล:

```powershell
ollama pull qwen2.5vl:7b
```

เช็กว่าโหลดสำเร็จ:

```powershell
ollama list
```

ควรเห็น `qwen2.5vl:7b`

หมายเหตุ:

- โมเดลไม่ได้ถูกเก็บไว้ใน repo นี้
- ถ้าผู้ใช้คนอื่นจะใช้ฟีเจอร์ AI ด้วย ต้องมี Ollama ของตัวเอง หรือใช้ Ollama server กลางร่วมกัน

## 5. Run The Project

รันทั้ง frontend + backend:

```powershell
npm run dev
```

โดยปกติจะได้:

- frontend: `http://localhost:5173`
- api: `http://127.0.0.1:3001`

ถ้าอยาก build:

```powershell
npm run build
```

## Development Commands

```powershell
npm run dev
npm run build
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Existing Features

### Database-backed features

- load users / posts / notifications จาก PostgreSQL
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

- generate draft post from uploaded image
- moderation ก่อนโพสต์
- translation Thai <-> English
- streaming status ตอน generate จากภาพ

## AI Flow

### Generate post from image

flow:

1. user อัปโหลดรูป
2. frontend ส่งรูปไป backend
3. backend เรียก Ollama
4. model คืน draft ของโพสต์
5. frontend เติม title/content/category ให้ dialog

route ที่เกี่ยวข้อง:

- `POST /api/ai/generate-post-from-image`
- `POST /api/ai/generate-post-from-image/stream`

### Moderation

ระบบ moderation มี 2 ชั้น:

1. rule-based filter
2. AI moderation

ชั้นแรกจะเช็ก:

- คำหยาบไทย
- คำหยาบอังกฤษ
- คำคุกคาม / hate / harassment
- spam / scam terms

ไฟล์ที่เกี่ยวข้อง:

- [server/contentFilter.mjs](./server/contentFilter.mjs)

ถ้าจะเพิ่มคำหยาบหรือ pattern ใหม่ ให้แก้ไฟล์นี้ก่อน

### Translation

route:

- `POST /api/ai/translate-post`

frontend จะใช้ภาษา default ของแอปเป็น target language

## How To Continue Developing

ถ้าจะพัฒนาต่อ แนะนำลำดับนี้:

### 1. Login / Identity layer

ตอนนี้ current user ยังเป็นลักษณะ development-friendly มากกว่า production auth

สิ่งที่ควรทำต่อ:

- local auth ชั่วคราว หรือ mock login selector
- session handling
- เตรียมเชื่อม university auth ภายหลัง

### 2. Role permissions

ตอนนี้หลาย action ยังอิงจาก current user ที่ frontend และ backend แบบพื้นฐาน

ควรเพิ่ม:

- admin actions
- club-specific actions
- stricter authorization checks

### 3. Resume persistence

ตอนนี้หน้า resume ยังไม่ต่อกับ database จริง

### 4. Calendar improvements

ตอนนี้ calendar ใช้โพสต์หมวด `event` และ `exam` เป็นหลัก

ควรแยก field เช่น:

- `eventDate`
- `endDate`
- `location`

### 5. Production cleanup

ควรแยก backend เป็น:

- routes
- services
- db layer
- validation

และเพิ่ม:

- logging
- error middleware
- request validation

## Where To Edit What

ถ้าจะเพิ่มฟีเจอร์ใหม่ ดูจากนี้ได้เลย:

- เพิ่ม route backend:
  - [server/index.mjs](./server/index.mjs)

- เพิ่มฟังก์ชันเรียก API:
  - [src/app/lib/bootstrap.ts](./src/app/lib/bootstrap.ts)

- เพิ่ม state หรือ wiring ของแอป:
  - [src/app/App.tsx](./src/app/App.tsx)

- เพิ่ม UI:
  - [src/app/components](./src/app/components)

- เพิ่ม schema database:
  - [prisma/schema.prisma](./prisma/schema.prisma)

- เพิ่ม seed data:
  - [prisma/seed.mjs](./prisma/seed.mjs)

## Troubleshooting

### `ollama is not recognized`

แปลว่า Ollama ยังไม่ได้ติดตั้ง หรือ terminal ยังไม่ refresh PATH

ให้:

1. ติดตั้ง Ollama
2. ปิด terminal / VS Code
3. เปิดใหม่
4. ลองรัน:

```powershell
ollama --version
```

### `model 'qwen2.5vl:7b' not found`

แปลว่ายังไม่ได้ pull model:

```powershell
ollama pull qwen2.5vl:7b
```

### Prisma connection error

ตรวจ:

- PostgreSQL เปิดอยู่ไหม
- `DATABASE_URL` ถูกไหม
- database มีอยู่จริงไหม

จากนั้นลอง:

```powershell
npm run db:push
```

### หน้าเว็บเปิดได้แต่ข้อมูลไม่เปลี่ยน

ตรวจ:

- backend รันอยู่ไหม
- API ใช้พอร์ต `3001`
- frontend ใช้พอร์ต `5173`

ลองเปิด:

```text
http://127.0.0.1:3001/api/health
```

ถ้าปกติควรได้:

```json
{"ok":true}
```

## Notes For Contributors

- โปรเจคนี้เคยเริ่มจาก prototype ดังนั้นบางส่วนยังมี mock-era structure ปนอยู่
- ตอนแก้โค้ด ควรระวังไม่ให้ frontend fallback logic พัง
- AI moderation ยังไม่ควรถือเป็น production safety system
- ถ้าจะ deploy จริง ควรเพิ่ม auth, validation, audit logging, และ permission checks ให้ครบ

## Suggested Next Steps

ถ้ารับงานนี้ไปพัฒนาต่อ แนะนำเริ่มจาก:

1. เพิ่ม auth จริง
2. เพิ่ม current user switch สำหรับ dev/test
3. แยก backend structure
4. ทำ resume ให้เก็บลง DB
5. เพิ่ม event schema สำหรับ calendar
6. ปรับ UX ฝั่ง mobile และ empty states

---

ถ้าต้องการ ผมช่วยต่อให้ได้อีก:

- เขียน `CONTRIBUTING.md`
- เขียน `SETUP.md` แยกเฉพาะการติดตั้ง
- เขียน README เวอร์ชันภาษาอังกฤษสำหรับใส่ GitHub
