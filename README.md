# Microblog

A short-form social feed built with Next.js 14 App Router, Tailwind CSS, and SQLite via Prisma.

## Features
- **Auth flow**: Dedicated login/register page with profile creation
- **Sessions**: Cookie-based sessions, 30-day expiry
- **Global feed**: Chronological posts from all users (no follower graph)
- **Post updates**: 180 character limit on posts
- **Likes**: Click to like/unlike posts and replies
- **Replies**: One-level deep threading (replies to posts only)
- **Profile filtering**: Click a user to view their posts
- **Persistence**: SQLite database via Prisma ORM

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + dark theme
- **Database**: SQLite + Prisma ORM
- **Auth**: Cookie-based sessions (server-side)
- **API**: Next.js route handlers

## Getting Started

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (already done):
   ```bash
   cp .env.example .env
   ```

3. Generate Prisma client & migrate:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

### Run
```bash
npm run dev
```

Visit http://localhost:3000. You'll be redirected to `/auth` to sign in or create a profile.

## Project Structure
- `src/app/` — Main app and routes
  - `page.js` — Authenticated home feed
  - `auth/page.js` — Login / register page
  - `api/` — Backend routes
    - `auth/` — Login, logout
    - `me/` — Current user
    - `feed/` — Fetch posts (with optional handle filter)
    - `posts/` — Create, like, reply
- `src/lib/` — Utilities
  - `prisma.js` — Prisma client singleton
  - `auth.js` — Session helpers
- `prisma/` — Database schema & migrations

## Build & Deploy
```bash
npm run build
npm start
```

## Constraints
- Global feed only (no followers/following)
- No private messaging or reposts
- Posts: max 180 characters
- Replies: one level deep, no reply-to-reply
- Sessions expire after 30 days

---

Happy building!
