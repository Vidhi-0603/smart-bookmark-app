# 📌 Realtime Bookmark Manager

A simple yet powerful bookmark manager built with **Next.js (App Router)** and **Supabase**, featuring Google OAuth login, protected routes, and realtime updates across multiple tabs.

---


## 🛠 Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS  
- **Backend & Database:** Supabase (PostgreSQL)  
- **Authentication:** Supabase Auth (Google OAuth)  
- **Realtime:** Supabase Realtime (Postgres Changes)  
- **Deployment:** Vercel  

---

## ✨ Features

- 🔐 Login with Google OAuth
- 🛡 Protected dashboard route
- ➕ Add bookmarks easily
- ❌ Delete bookmarks
- 🔄 Realtime sync between tabs
- 🔒 User-specific Row Level Security (RLS)
- ☁ Deployed live on Vercel

---

## 📂 Project Structure

```
app/
  ├── page.tsx
  ├── auth/
  │     ├── callback/
  │        |── route.ts
  ├── dashboard/
  │     ├── page.tsx
  │     └── DashboardClient.tsx
lib/
  ├── supabase/
  │     ├── server.ts
  └── supabaseClient.ts
```

---

## 🔐 Route Protection

Initially, the app relied solely on **supabase-js** on the client to protect routes. This worked, but users could briefly see the dashboard before the redirect, and session validation was only client-side.

- ✅ To fix this, we transitioned to **Supabase SSR** (server-side) for route protection. Now, the server checks the session before rendering the dashboard, ensuring no sensitive data flashes on the screen before redirect.

---

## 🔄 Realtime Implementation

Realtime is powered by Supabase Postgres Changes. Each user sees only their bookmarks in real-time:

```ts
supabase
  .channel("bookmarks-realtime")
  .on("postgres_changes", { ... })
  .subscribe();
```

---

## 🔒 Row Level Security (RLS)

Strict RLS policies ensure that users can only access their own bookmarks:

- SELECT, INSERT, UPDATE, DELETE policies scoped with:

```sql
auth.uid() = user_id
```

This keeps each user's data private and ensures realtime updates respect these restrictions.

---

## Challenges Faced

### 1️⃣ Realtime INSERT Sometimes Not Firing

- Issue: Occasionally, inserts wouldn't trigger realtime events.  
- Solution:
  - Ensure only **one subscription per user**
  - Clean up channels on unmount
  - Set `REPLICA IDENTITY FULL` on the bookmarks table
  - Corrected RLS policies to use `auth.uid() = user_id`

### 2️⃣ Realtime Updates Across Tabs Inconsistent

- Issue: Changes in one tab didn't always appear in another.
- Solution:
  - Verified RLS SELECT policy for user isolation
  - Made sure UUID for `user_id` matched auth.uid()
  - Stabilized subscription to depend only on `[user?.id]`

### 3️⃣ Optimistic UI Causing Duplicates

- Issue: `.insert().select()` returned an array, sometimes creating duplicates.
- Solution: Used `data[0]` for optimistic updates and prevented duplicates.

### 4️⃣ OAuth Redirect Issues

- Issue: Login worked locally but failed on Vercel.
- Solution:
  - Updated Supabase Auth redirect URLs to include Vercel domain
  - Added Vercel domain in Google Cloud OAuth settings

### 5️⃣ Environment Variables in Production

- Issue: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were missing on deployment.
- Solution: Added them in Vercel project settings with the correct prefix.

### 6️⃣ Transition from supabase-js to SSR

- Issue: Protecting the dashboard route purely on the client caused brief exposure of sensitive data.
- Solution: Migrated to Supabase SSR (`createServerClient`) to handle auth on the server. Now the dashboard only renders if the session is valid, making the app secure and production-ready.

---

## 🧪 How to Run Locally

```bash
git clone <repo>
cd project
npm install
npm run dev
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## 📈 Future Improvements

- Edit bookmark feature
- Loading states & animations
- Pagination
- Bookmark categories
- Dark mode
- Drag-and-drop reordering

---

## 👩‍💻 Author

Vidhilika Gupta  
MCA Final Year Student  
Aspiring Full Stack Developer

