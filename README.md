# 🎯 JobTrack

A fast, focused, and elegant personal career operating system and job-search tracker with an integrated personal Content Studio.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL + RLS)**. Designed with inspiration from modern productivity tools like Linear, Raycast, and Notion.

---

## 🌟 Overview

JobTrack is crafted to eliminate the chaos of tracking job applications, interviews, contacts, and recruiter communications across multiple platforms. In addition to career tracking, JobTrack includes a dedicated **Content Studio** for creators who share learnings, career journey updates, and industry insights.

### 💼 1. Job Search OS
- **Pipeline & Applications**: Track applications across defined stages (`Bookmarked`, `Applying`, `Applied`, `Screening`, `Technical`, `Behavioral`, `Offer`, `Rejected`, `Withdrawn`).
- **Company Management**: Maintain a central repository of target companies with details such as industry, company size, website, location, and notes.
- **Contact Directory**: Keep recruiter, hiring manager, and interviewer information organized with emails, phone numbers, and LinkedIn profiles.
- **Interaction & Activity Timeline**: Chronological log of incoming and outgoing communications across channels (LinkedIn DM, Email, Phone, Referral, In-Person).
- **Follow-up Reminders**: Overdue alerts and scheduled follow-ups so no opportunity slips through the cracks.
- **Metrics Dashboard**: At-a-glance summary cards showing active applications, upcoming interviews, response rates, and follow-ups due today.

### ✍️ 2. Personal Content Studio
- **Creator Workflow**: Track content creation from concept to delivery:
  $$\text{Idea} \longrightarrow \text{Script} \longrightarrow \text{Recording} \longrightarrow \text{Editing} \longrightarrow \text{Ready} \longrightarrow \text{Scheduled} \longrightarrow \text{Published}$$
- **Content Pipeline & Kanban**: Visual stage boards with platform tags, scheduled publishing dates, and full script notes.
- **Focused & Manual**: Pure creator workspace designed for personal production without social media clutter or complex automation.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security & Supabase Auth)
- **Routing & State**: [React Router v7](https://reactrouter.com/), Context API + Custom Hooks
- **Toasts & Feedback**: [Sonner](https://sonner.emilkowal.ski/)
- **Linting & Quality**: [Oxlint](https://oxc.rs/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or later
- **npm**, **pnpm**, or **yarn**
- A **Supabase** project ([supabase.com](https://supabase.com))

### 1. Clone & Install Dependencies

```bash
cd jobtrack
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `jobtrack` root directory by copying `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Database Migrations

Run the SQL migration scripts located in `supabase/migrations/` inside your Supabase SQL Editor in numerical order:

1. `supabase/migrations/001_initial_schema.sql` — Profiles, Companies, Opportunities, Contacts, Interactions, and RLS policies.
2. `supabase/migrations/002_content_schema.sql` — Content Items schema, workflow enums, and RLS policies.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Available Scripts

- `npm run dev`: Starts the local Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles TypeScript (`tsc -b`) and bundles production assets.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Fast linting with Oxlint.

---

## 📁 Project Structure

```text
jobtrack/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, icons, and SVG assets
│   ├── components/
│   │   ├── layout/         # Header, Sidebar, and App layout shells
│   │   ├── ui/             # Radix UI & design system primitive components
│   │   └── ProtectedRoute.tsx # Route protection guard
│   ├── features/
│   │   ├── auth/           # Authentication state, context, and handlers
│   │   ├── companies/      # Company hooks, cards, and modals
│   │   ├── contacts/       # Contact management components
│   │   ├── content/        # Content Studio pipeline & detail views
│   │   ├── interactions/   # Activity logging & interaction forms
│   │   ├── opportunities/  # Job opportunity stages & workflows
│   │   └── timeline/       # Visual interaction timeline
│   ├── lib/                # Supabase client setup, constants, and utils
│   ├── pages/              # Application route pages
│   ├── types/              # TypeScript definitions & Supabase DB types
│   ├── App.tsx             # Root route definitions
│   └── main.tsx            # React application entry point
├── supabase/
│   └── migrations/         # PostgreSQL schema & RLS migration files
├── package.json
└── vite.config.ts
```

---

## 🔒 Security & Data Privacy

- **Row Level Security (RLS)** is enforced on all database tables (`companies`, `opportunities`, `contacts`, `interactions`, `content_items`, `profiles`).
- Every record is strictly scoped to the authenticated user ID (`auth.uid()`), ensuring complete data isolation.
- No sensitive service-role keys are exposed on the client.

---

## 📄 License

Private & Personal Workspace. All rights reserved.
