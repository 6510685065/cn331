
  # Smart Campus Micro-Community Platform (Copy)

  This is a code bundle for Smart Campus Micro-Community Platform (Copy). The original project is available at https://www.figma.com/design/oAVGzcEHCDAPqp84T9FT2t/Smart-Campus-Micro-Community-Platform--Copy-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Database setup

  The project now includes a first-pass real database schema using Prisma with PostgreSQL.

  1. Copy `.env.example` to `.env`
  2. Set `DATABASE_URL` to your local PostgreSQL database
  3. Run `npm i`
  4. Run `npm run db:generate`
  5. Run `npm run db:push`
  6. Run `npm run db:seed`

  Helpful commands:

  - `npm run db:migrate` to create migrations during development
  - `npm run db:studio` to inspect data in Prisma Studio

  ## Local AI with Ollama

  The app can also call a local Ollama model for:

  - generating post drafts from uploaded images
  - checking post content for profanity or spam before publishing
  - translating posts between Thai and English

  Setup:

  1. Install Ollama on the machine that will run the app
  2. Pull the model: `ollama pull qwen2.5vl:7b`
  3. Add `OLLAMA_URL` and `OLLAMA_MODEL` to `.env`
  4. Run `npm run dev`

  Notes:

  - The model is not stored inside this repository
  - Each user needs their own Ollama installation, or you can point `OLLAMA_URL` to a shared Ollama server on your network

  ## Current database scope

  The schema currently covers:

  - users
  - posts
  - comments
  - post likes
  - post saves
  - notifications

  It also includes `authProvider` and `externalAuthId` on `User` so university login can be connected later without redesigning the core tables.
  
