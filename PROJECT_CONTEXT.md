# AI Coding Starter Kit

> A Next.js template with an AI-powered development workflow using 6 specialized agents

## Vision
Build web applications faster with AI agents handling Requirements, Architecture, Development, QA, and Deployment. Each agent has clear responsibilities and a human-in-the-loop workflow for quality control.

---

## Aktueller Status
Template ready - Start by defining your first feature!

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16.1.1 (App Router) - Latest version
- **Language:** TypeScript 5 (strict mode enabled)
- **Styling:** Tailwind CSS 3.4 with custom configuration
- **UI Library:** shadcn/ui (Radix UI primitives + copy-paste components)
- **React:** 19.0.0 (latest)
- **Form Handling:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Theme:** next-themes for dark mode support

### Backend
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Auth:** Supabase Auth (built-in authentication)
- **Client Library:** @supabase/supabase-js v2.39.3
- **API Routes:** Next.js App Router API routes
- **State Management:** React useState / Context API
- **Data Fetching:** React Server Components + fetch

### Development Tools
- **Package Manager:** npm (Node.js v25.3.0)
- **Linting:** ESLint 9 with Next.js config
- **TypeScript Config:** Strict mode, bundler module resolution
- **Path Aliases:** @/* mapped to src/*

### Deployment
- **Hosting:** Vercel (recommended) or Netlify
- **Build:** Next.js production build
- **Environment:** Server and client environment variables

---

## Features Roadmap

### In Development
- **[PROJ-1] User Authentication** → 🟢 In Development → [Spec](features/PROJ-1-user-authentication.md)
  - Frontend implementation completed
  - Backend/RLS policies pending review
  - QA testing pending
  - Features: Email/Password auth, email verification, rate limiting, password reset, protected routes

### Upcoming Features
- [PROJ-2] Your Next Feature → ⚪ Backlog

Start by defining your next feature using the Requirements Engineer agent:
```
Read .claude/agents/requirements-engineer.md and create a feature spec for [your feature idea]
```

---

## Status-Legende
- ⚪ Backlog (noch nicht gestartet)
- 🔵 Planned (Requirements geschrieben)
- 🟡 In Review (User reviewt)
- 🟢 In Development (Wird gebaut)
- ✅ Done (Live + getestet)

---

## Development Workflow

1. **Requirements Engineer** erstellt Feature Spec → User reviewt
2. **Solution Architect** designed Schema/Architecture → User approved
3. **PROJECT_CONTEXT.md** Roadmap updaten (Status: 🔵 Planned → 🟢 In Development)
4. **Frontend + Backend Devs** implementieren → User testet
5. **QA Engineer** führt Tests aus → Bugs werden gemeldet
6. **DevOps** deployed → Status: ✅ Done

---

## Environment Variables

### Required for Supabase Integration

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Important Notes:**
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- The anon key is safe to expose (Row Level Security protects your data)
- Never commit `.env.local` to version control (already in .gitignore)
- See `.env.local.example` for the template

### Supabase Client Setup

The Supabase client is configured in [src/lib/supabase.ts](src/lib/supabase.ts) and ready to use:

```typescript
import { supabase } from '@/lib/supabase'

// Example usage
const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

---

## Agent-Team Verantwortlichkeiten

- **Requirements Engineer** (`.claude/agents/requirements-engineer.md`)
  - Feature Specs in `/features` erstellen
  - User Stories + Acceptance Criteria + Edge Cases

- **Solution Architect** (`.claude/agents/solution-architect.md`)
  - Database Schema + Component Architecture designen
  - Tech-Entscheidungen treffen

- **Frontend Developer** (`.claude/agents/frontend-dev.md`)
  - UI Components bauen (React + Tailwind + shadcn/ui)
  - Responsive Design + Accessibility

- **Backend Developer** (`.claude/agents/backend-dev.md`)
  - Supabase Queries + Row Level Security Policies
  - API Routes + Server-Side Logic

- **QA Engineer** (`.claude/agents/qa-engineer.md`)
  - Features gegen Acceptance Criteria testen
  - Bugs dokumentieren + priorisieren

- **DevOps** (`.claude/agents/devops.md`)
  - Deployment zu Vercel
  - Environment Variables verwalten
  - Production-Ready Essentials (Error Tracking, Security Headers, Performance)

---

## Production-Ready Features

This template includes production-readiness guides integrated into the agents:

- **Error Tracking:** Sentry setup instructions (DevOps Agent)
- **Security Headers:** XSS/Clickjacking protection (DevOps Agent)
- **Performance:** Database indexing, query optimization (Backend Agent)
- **Input Validation:** Zod schemas for API safety (Backend Agent)
- **Caching:** Next.js caching strategies (Backend Agent)

All guides are practical and include code examples ready to copy-paste.

---

## Design Decisions

Document your architectural decisions here as your project evolves.

**Template:**
- **Why did we choose X over Y?**
  → Reason 1
  → Reason 2

---

## Folder Structure

```
test-projekt/
├── .claude/                     ← AI Agent System
│   └── agents/                  ← 6 specialized agents
│       ├── requirements-engineer.md   ← Creates feature specs
│       ├── solution-architect.md      ← Designs architecture
│       ├── frontend-dev.md            ← Builds UI components
│       ├── backend-dev.md             ← Implements server logic
│       ├── qa-engineer.md             ← Tests features
│       └── devops.md                  ← Handles deployment
│
├── features/                    ← Feature Specifications
│   ├── README.md                ← How to write feature specs
│   └── [PROJ-X]-feature.md      ← Individual feature docs
│
├── src/                         ← Source Code (App Router)
│   ├── app/                     ← Next.js pages and layouts
│   │   ├── layout.tsx           ← Root layout
│   │   ├── page.tsx             ← Home page
│   │   └── globals.css          ← Global styles + Tailwind
│   │
│   ├── components/              ← React Components
│   │   └── ui/                  ← shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── [30+ components]
│   │
│   ├── lib/                     ← Utilities & Clients
│   │   ├── supabase.ts          ← Supabase client instance
│   │   └── utils.ts             ← Helper functions (cn, etc.)
│   │
│   └── hooks/                   ← Custom React Hooks
│       └── use-toast.ts         ← Toast notification hook
│
├── public/                      ← Static Assets
│   └── [images, fonts, etc.]
│
├── .next/                       ← Next.js build output (gitignored)
├── node_modules/                ← Dependencies (gitignored)
│
├── .env.local                   ← Environment variables (gitignored)
├── .env.local.example           ← Template for environment vars
├── .gitignore                   ← Git ignore rules
│
├── next.config.ts               ← Next.js configuration
├── tsconfig.json                ← TypeScript configuration (strict mode)
├── tailwind.config.ts           ← Tailwind CSS configuration
├── postcss.config.mjs           ← PostCSS configuration
├── components.json              ← shadcn/ui configuration
│
├── package.json                 ← Dependencies & scripts
├── package-lock.json            ← Lockfile
│
├── PROJECT_CONTEXT.md           ← This file - project overview
├── README.md                    ← Project README
└── HOW_TO_USE_AGENTS.md         ← Agent workflow guide
```

### Key Directories Explained

**src/app/** - Next.js App Router
- Each folder represents a route
- `layout.tsx` wraps pages with shared UI
- `page.tsx` files are the actual pages
- Server Components by default (can use `'use client'` for client components)

**src/components/** - React Components
- Reusable UI components
- `ui/` subfolder contains shadcn/ui components
- Use shadcn/ui CLI to add components: `npx shadcn@latest add [component]`

**src/lib/** - Utilities
- `supabase.ts` - Pre-configured Supabase client
- `utils.ts` - Helper functions (Tailwind class merging, etc.)

**src/hooks/** - Custom Hooks
- Reusable React hooks
- Toast notifications, custom logic, etc.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

This installs all required packages including:
- Next.js 16.1.1
- React 19
- TypeScript 5
- Tailwind CSS
- @supabase/supabase-js
- shadcn/ui components (30+ pre-installed)

### 2. Setup Environment Variables

**If you're using Supabase:**

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy the template:
   ```bash
   cp .env.local.example .env.local
   ```
3. Add your credentials to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. The Supabase client in [src/lib/supabase.ts](src/lib/supabase.ts) is now ready to use

**If you're NOT using Supabase yet:**
- You can skip this step
- The app will work without Supabase
- Add it later when you need database functionality

### 3. Start Development Server
```bash
npm run dev
```

Your app runs at [http://localhost:3000](http://localhost:3000)

### 4. Available Scripts
```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint checks
```

### 5. Start Using the AI Agent Workflow

Tell Claude to read an agent file and start working:

**Example:**
```
Read .claude/agents/requirements-engineer.md and create a feature spec for [your idea]
```

The workflow: Requirements → Architecture → Development → QA → Deployment

---

## Next Steps for Development

### Option 1: Build with AI Agent System (Recommended)

1. **Define your first feature idea**
   - Think about what you want to build
   - Example: User authentication, blog, dashboard, etc.

2. **Start with Requirements Engineer**
   ```
   Read .claude/agents/requirements-engineer.md and create a feature spec for [your idea]
   ```
   - The agent asks clarifying questions
   - Creates a detailed spec in `/features/`

3. **Follow the workflow**
   - Requirements Engineer → Solution Architect → Developers → QA → DevOps
   - Each agent hands off to the next
   - Track progress in this file

4. **Track progress via Git**
   - Feature specs show status (⚪ → 🔵 → 🟢 → ✅)
   - Use `git log --grep="PROJ-X"` to see history

### Option 2: Standard Next.js Development

1. **Add pages in** [src/app/](src/app/)
   ```typescript
   // src/app/about/page.tsx
   export default function AboutPage() {
     return <div>About page</div>
   }
   ```

2. **Create components in** [src/components/](src/components/)
   ```typescript
   // src/components/my-component.tsx
   export function MyComponent() {
     return <div>Hello</div>
   }
   ```

3. **Add UI components with shadcn/ui**
   ```bash
   npx shadcn@latest add [component-name]
   ```
   Available: button, card, dialog, dropdown, form, input, etc.

4. **Connect to Supabase** (when ready)
   ```typescript
   import { supabase } from '@/lib/supabase'

   const { data } = await supabase.from('table').select('*')
   ```

### Learning Resources

- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **shadcn/ui Docs:** [ui.shadcn.com](https://ui.shadcn.com)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

**Built with AI Agent Team System + Claude Code**
