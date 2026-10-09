# FreshGuard AI — Project Setup & Developer Guide

## 1. Project Overview & Architecture
FreshGuard AI is an agentic decision-support prototype engineered to minimize avoidable food waste and prevent perishable stockouts across retail grocery stores.

The project is organized as a **shared monorepo** housing the manager-facing client application (built with **Next.js App Router**), the future FastAPI backend, data pipelines, and documentation.

```text
agenticAI/
├── .git/                      # Local Git repository
├── .gitignore                 # Root gitignore (ignoring .next/, build, dist, .env, DBs)
├── .env.example               # Template environment configuration (Next.js & Backend)
├── documentation/             # Baseline specifications & architecture docs (.docx)
├── docs/                      # Technical documentation & API contracts
│   ├── project-setup.md       # This file
│   ├── frontend-api-contract.md # Frontend/Backend REST interface definitions
│   ├── frontend-work-plan.md  # 5-batch frontend roadmap & deliverables
│   └── backend-questions.md   # Unresolved technical questions for backend team
├── frontend/                  # Next.js App Router + TypeScript client application
│   ├── .env.example           # Frontend environment template
│   ├── .env                   # Local environment (git-ignored)
│   ├── .gitignore             # Frontend-specific exclusions
│   ├── package.json           # Next.js scripts and dependencies
│   ├── next.config.mjs        # Next.js configuration
│   ├── postcss.config.mjs     # PostCSS Tailwind CSS v4 configuration
│   ├── tsconfig.json          # TypeScript compiler configuration with @/* aliases
│   └── src/
│       ├── app/               # Next.js App Router (6 Manager-facing screens)
│       │   ├── layout.tsx     # Root layout wrapping AppProvider & AppLayout
│       │   ├── page.tsx       # Screen 1: Overview Dashboard
│       │   ├── globals.css    # Tailwind CSS v4 entry point
│       │   ├── inventory/
│       │   │   ├── page.tsx   # Screen 2: Inventory & Risk Queue
│       │   │   └── [productId]/
│       │   │       └── page.tsx # Screen 3: Product Detail View
│       │   ├── recommendations/
│       │   │   └── page.tsx   # Screen 4: Recommendation Review & Action Queue
│       │   ├── scenarios/
│       │   │   └── page.tsx   # Screen 5: Scenario Comparison & Benchmark
│       │   └── audit/
│       │       └── page.tsx   # Screen 6: Decision Audit Log
│       ├── components/
│       │   ├── layout/        # Sidebar, Topbar, AppLayout
│       │   └── ui/            # MetricCard, RiskBadge, StatusBadge, EmptyState, PageHeader
│       ├── context/           # AppContext (interactive in-session review decisions & audit trail)
│       ├── data/              # Centralized typed mock fixtures
│       └── types/             # TypeScript interfaces (inventory, recommendation, scenario, audit)
├── backend/                   # (Planned) Python FastAPI service
└── reports/                   # Batch execution & progress reports
    ├── BATCH_1_WORK_REPORT.md # Batch 1 completion report
    └── BATCH_2_WORK_REPORT.md # Batch 2 completion report
```

---

## 2. Technology Stack & Verified Versions

| Category | Technology | Verified Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `16.4.0` (Turbopack) | React full-stack application framework |
| **Runtime** | Node.js | `v24.19.0` (LTS) | Frontend development & build runtime |
| **Package Manager**| npm | `11.17.0` | Dependency resolution & script execution |
| **Language** | TypeScript | `~6.0.2` | Static typing & type safety with `@/*` aliases |
| **Styling** | Tailwind CSS | `4.3.3` via `@tailwindcss/postcss` | Modern utility-first responsive styling |
| **Charts** | Recharts | `3.10.1` | Forecast trajectories, risk distribution & benchmark graphs |
| **Icons** | Lucide React | `1.54.0` | Enterprise iconography |
| **Backend Target** | Python / FastAPI | Python `3.14.7` | Machine learning, agent coordination, REST API |
| **Database Target**| SQLite | SQLite 3 | Relational persistence (`freshguard.db`) |

---

## 3. Installation & Startup Commands

### Prerequisites
* **Node.js**: `v20.x` or `v24.x`
* **npm**: `v10.x` or higher
* **Git**: Installed and available in PATH

### Frontend Startup
1. Open PowerShell and navigate to `frontend/`:
   ```powershell
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```
3. Start the Next.js development server:
   ```powershell
   npm run dev
   ```
   *The server runs locally at: `http://localhost:3000/`*

---

## 4. Development & Build Commands

All frontend commands are run from `frontend/`:

| Task | Command | Description |
|---|---|---|
| Start Dev Server | `npm run dev` | Runs Next.js development server on port 3000 |
| Production Build | `npm run build` | Compiles TypeScript and builds optimized static & dynamic pages via Turbopack |
| Production Start | `npm run start` | Runs the compiled Next.js production server |
| Linting | `npm run lint` | Runs Next.js ESLint / type validation |

---

## 5. Environment Configuration

### Frontend Variables (`frontend/.env`)
* `NEXT_PUBLIC_API_BASE_URL`: Base URL of the FastAPI backend (Default: `http://localhost:8000`).
* `NEXT_PUBLIC_APP_ENV`: Application environment (`development` / `production`).

> **Security Rule**: In Next.js, only variables prefixed with `NEXT_PUBLIC_` are accessible in the client browser. Never place private keys, database credentials, or secret service tokens in these variables.
