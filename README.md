<div align="center">

# 🌿 Fresh Orbit
### Agentic AI Decision Support for Perishable Demand & Shelf-Life Risk Operations

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://python.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render)](https://freshorbit-1.onrender.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)

<p align="center">
  <strong>Fresh Orbit</strong> is an autonomous multi-agent platform designed for grocery chains and perishable food retailers. It predicts expiry risks, synchronizes real-time demand signals, and automates markdown, transfer, and replenishment decisions to minimize food waste while preventing costly stockouts.
</p>

[Live Backend (Render)](https://freshorbit-1.onrender.com/health) • [API Documentation](https://freshorbit-1.onrender.com/docs) • [Explore Screens](#-core-platform-modules)

</div>

---

## 📌 Executive Summary & Problem Statement

Grocery retailers operate perishable supply chains on razor-thin operating margins. Traditional inventory management systems rely on static threshold rules and manual end-of-day shelf sweeps, resulting in:

- **15–25% avoidable perishable shrinkage and food waste** written off directly against margin.
- **Suboptimal markdowns** initiated too late in the sales cycle, forcing heavy 50%+ discounts.
- **Stockout penalties** from uncoordinated store orders that fail to cross-balance excess stock from neighboring locations.
- **Disconnected systems** where POS, ERP, and WMS data operate in silos without coordinated action.

**Fresh Orbit** bridges this gap with an orchestrated multi-agent engine that monitors SKU-level batch expiry horizons, dynamically balances trade-offs, and provides human planners with explainable, actionable recommendations.

---

## 🤖 Multi-Agent Architecture

The core decision engine runs a collaborative 5-agent pipeline orchestrated by a central coordinator:

```
                          ┌───────────────────────────┐
                          │   Live Ingestion Signals  │
                          │ (POS, WMS, Weather, Promo)│
                          └─────────────┬─────────────┘
                                        │
        ┌───────────────────────────────┴───────────────────────────────┐
        ▼                               ▼                               ▼
┌──────────────┐                ┌──────────────┐                ┌──────────────┐
│ DemandAgent  │                │FreshnessAgent│                │ReplenishAgent│
│ 3-7d Sales   │                │ Expiry Batch │                │  Stockout    │
│  Velocity    │                │  Risk Model  │                │  Prevention  │
└───────┬──────┘                └───────┬──────┘                └───────┬──────┘
        │                               │                               │
        └───────────────┬───────────────┴───────────────┬───────────────┘
                        ▼                               ▼
                ┌──────────────┐                ┌──────────────┐
                │MarkdownAgent │                │TransferAgent │
                │Dynamic Price │                │ Cross-Store  │
                │ Optimization │                │ Logistics    │
                └───────┬──────┘                └───────┬──────┘
                        │                               │
                        └───────────────┬───────────────┘
                                        ▼
                        ┌───────────────────────────────┐
                        │     Central Orchestrator      │
                        │ • Confidence Scoring (0-1.0)  │
                        │ • Trade-off Arbitration       │
                        │ • Explainable AI Evidence     │
                        └───────────────┬───────────────┘
                                        ▼
                        ┌───────────────────────────────┐
                        │   Human-in-the-Loop Review    │
                        │ (Approve / Edit / Override)   │
                        └───────────────────────────────┘
```

### Agent Roles:
1. **DemandAgent**: Calculates short-horizon (3–7 day) sales velocity incorporating price elasticity, weekday/weekend traffic patterns, local weather shifts, and scheduled marketing events.
2. **FreshnessAgent**: Tracks batch-specific expiry horizons (`BATCH-M1`, `BATCH-B9`), assigns risk tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), and computes projected unsold units at current velocity.
3. **MarkdownAgent**: Evaluates timing and depth of price interventions (e.g., 20% flash markdown vs. 50% evening clearance) to accelerate sell-through before expiration cutoffs.
4. **TransferAgent**: Analyzes cross-store inventory imbalances and identifies opportunities to re-route at-risk inventory to high-demand suburban or downtown stores via temperature-controlled logistics.
5. **ReplenishmentAgent**: Monitors critical stockout thresholds, assesses vendor lead times, and triggers simulated purchase orders.
6. **Orchestrator**: Resolves agent conflicts, calculates net financial benefit, generates natural-language justification evidence, and enforces business governance rules.

---

## 🖥️ Core Platform Modules

| Module | Route | Key Capabilities |
|---|---|---|
| **Overview Dashboard** | `/` | Real-time perishable health telemetry, urgent expiry count, total dollar waste exposure, pending action queue, and system health status. |
| **Inventory & Risk Queue** | `/inventory` | Search, filter by category/store/risk level, batch cohort distribution, days-to-expiry counters, and stockout vulnerability indicators. |
| **Product Detail & Telemetry** | `/inventory/[productId]` | In-depth batch breakdowns, actual vs. predicted sales trajectories, AI evidence chain, and live demand curves. |
| **Recommendation Review** | `/recommendations` | Human-in-the-loop action queue with one-click **Approve**, **Edit** (custom discount/qty), and **Reject** workflows. |
| **Scenario Comparison** | `/scenarios` | Side-by-side benchmark comparing Fresh Orbit vs. static rule-based baselines on waste units, financial loss, stockouts, and forecast MAE. |
| **Decision Audit Log** | `/audit` | Immutable audit trail capturing timestamped approvals, manager notes, overrides, and simulated ERP/POS execution dispatches. |
| **Crowd & Demand Operations** | `/crowd` | Dynamic store foot-traffic monitoring, event surges, and operational demand scenario testing. |

---

## 🏗️ Monorepo Structure

```text
agenticAI/
├── backend/                       # Python FastAPI Backend Service
│   ├── app/
│   │   ├── main.py                # REST endpoints, CORS middleware & lifespan
│   │   ├── agents.py              # 5-agent pipeline + Orchestrator engine
│   │   ├── models.py              # SQLAlchemy database ORM models
│   │   ├── schemas.py             # Pydantic request/response validation schemas
│   │   ├── database.py            # SQLite / PostgreSQL engine & session factory
│   │   ├── seed.py                # Database population with perishable catalog
│   │   ├── synthetic_data.py      # Synthetic POS, weather, store & batch generator
│   │   └── evaluation.py          # Benchmark comparison & baseline evaluation logic
│   ├── tests/                     # Pytest suite for agents and API endpoints
│   ├── requirements.txt           # Python dependencies (FastAPI, Uvicorn, SQLAlchemy, etc.)
│   └── freshguard.db              # Local SQLite database
│
├── frontend/                      # Next.js 16 Client Application
│   ├── src/
│   │   ├── app/                   # App Router pages (Dashboard, Inventory, Recommendations, etc.)
│   │   ├── components/            # UI components (MetricCards, RiskBadges, Sidebar, Topbar)
│   │   ├── context/               # AppContext managing local reviews and audit state
│   │   ├── services/              # apiClient.ts (REST) & supabaseClient.ts (Realtime)
│   │   └── types/                 # TypeScript interfaces for inventory, scenarios, audit
│   ├── package.json               # Frontend dependencies (React 19, Recharts, Tailwind v4)
│   └── next.config.mjs            # Next.js build configuration
│
└── docs/                          # Technical specs, architecture diagrams & SQL schemas
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/saidev-manish/FreshOrbit.git
cd FreshOrbit
```

### 2. Backend Setup (FastAPI)
```bash
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend is now accessible at `http://localhost:8000` (Interactive API docs at `http://localhost:8000/docs`).*

### 3. Frontend Setup (Next.js)
In a new terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```
*Frontend is now accessible at `http://localhost:3000`.*

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)
```ini
# Backend API Endpoint
NEXT_PUBLIC_API_BASE_URL=https://freshorbit-1.onrender.com

# Application Environment (development | production)
NEXT_PUBLIC_APP_ENV=production

# Supabase Realtime Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jchxqmrgngavtiakhdzq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_S3zSseUIzlF0gDRRTzu4sw_VejKMpTc
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_S3zSseUIzlF0gDRRTzu4sw_VejKMpTc
```

### Backend (`backend/.env`)
```ini
APP_ENV=production
FRESHGUARD_DATABASE_URL=sqlite:///./freshguard.db
```

---

## ☁️ Deployment Architecture

```text
GitHub (saidev-manish/FreshOrbit)
  │
  ├── backend/  ──► Render (Web Service)
  │                   • Build Command: pip install -r requirements.txt
  │                   • Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
  │                   • Live URL: https://freshorbit-1.onrender.com
  │
  └── frontend/ ──► Vercel (Next.js Framework)
                      • Root Directory: frontend
                      • Env Variable: NEXT_PUBLIC_API_BASE_URL = https://freshorbit-1.onrender.com
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint returning runtime status & database state. |
| `GET` | `/dashboard/summary` | High-level KPI aggregations (at-risk count, waste exposure, stockouts). |
| `GET` | `/products` | Query SKU list with optional `category`, `risk_level`, and `search` filters. |
| `GET` | `/products/{id}` | Detailed SKU metadata, batch expiry cohorts, and demand history. |
| `GET` | `/recommendations` | Active ranked agent recommendations with confidence scores. |
| `POST` | `/recommendations/run` | Triggers a fresh execution of the multi-agent pipeline. |
| `POST` | `/recommendations/{id}/action` | Records manager decision (`APPROVED`, `EDITED_APPROVED`, `REJECTED`). |
| `GET` | `/scenarios` | Precomputed benchmark scenarios comparing agentic vs. baseline rules. |
| `GET` | `/audit-events` | Chronological audit trail of all manual and automated actions. |

---

## 📊 Evaluation & Financial Impact

Testing against synthetic grocery datasets demonstrates clear advantages over traditional rule-based practices:

| Performance Metric | Traditional Baseline | Fresh Orbit Multi-Agent | Net Improvement |
|---|---|---|---|
| **Avoidable Waste Units** | 68 units | 22 units | **-67.6% waste** |
| **Projected Waste Cost** | $142.80 | $46.20 | **+$96.60 saved / SKU wave** |
| **Stockout Incidents** | 2 | 0 | **100% elimination** |
| **Forecast Error (MAE)** | 4.8 units | 1.9 units | **60.4% error reduction** |
| **Operating Margin** | $384.20 | $512.60 | **+33.4% margin lift** |

---

## 🛡️ License

This project is built and maintained by the **Fresh Orbit** development team. Distributed under the MIT License. See `LICENSE` for more information.
