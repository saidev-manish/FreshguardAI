# FreshGuard AI — Frontend Multi-Batch Implementation Plan

This work plan outlines the 5-phase delivery roadmap for the FreshGuard AI frontend application, aligned with the four-member team structure and hackathon timeline.

---

## Batch 1: Project Setup, Repository Configuration & Planning
* **Status**: **COMPLETED**
* **Focus**: Monorepo scaffolding, environment guardrails, Git configuration, and API contract specifications.

---

## Batch 2: UI Foundation & Six Frontend Screens (Next.js App Router)
* **Status**: **COMPLETED**
* **Focus**: Migration to Next.js 16 App Router, enterprise UI design system, shared application shell, responsive navigation, centralized typed mock fixtures, and full implementation of all six manager-facing screens.

### Deliverables
1. **Application Shell & Navigation**:
   * Desktop Sidebar with brand identity, store location selector, route status badges, and prototype notice.
   * Topbar with planning date filter, live agent engine indicator, and "Run FreshGuard Analysis" CTA.
   * Responsive mobile drawer navigation.
2. **Screen 1 — Overview Dashboard (`/`)**:
   * Five KPI metric cards: Tracked SKUs, High/Critical count, Expiring ≤ 24h count, Waste Exposure ($), and Pending Recommendations.
   * Recharts Donut Chart showing inventory risk distribution.
   * Recharts Bar Chart showing upcoming expiration horizons.
   * Priority Inventory Alerts table linking directly to product inspection.
   * Coordinated recommendations queue summary.
3. **Screen 2 — Inventory & Risk Queue (`/inventory`)**:
   * Real-time search across product name, SKU, and ID.
   * Multi-facet filters: Category, Risk Tier (Critical, High, Medium, Low), and Expiry Horizon.
   * Interactive column sorting by days to expiry, on-hand quantity, name, and risk severity.
   * Responsive table with risk badges and data quality indicators.
4. **Screen 3 — Product Detail View (`/inventory/[productId]`)**:
   * Telemetry stats grid (stock, cost, price, next expiry date, expected unsold units).
   * Recharts dual Line Chart comparing observed daily sales against forecasted demand horizon.
   * Batch expiry cohort breakdown table.
   * Coordinator rationale and numbered evidence trail.
   * Dynamic not-found handling for unknown product IDs.
5. **Screen 4 — Recommendation Review & Action Queue (`/recommendations`)**:
   * Action Cards for Markdown, Transfer, Replenishment, and No-Action proposals.
   * Detailed estimated trade-offs breakdown (Avoided Waste vs. Margin Impact vs. Net Benefit).
   * Functional **Approve**, **Edit** (with custom inputs modal), and **Reject** (with reason modal) actions.
   * In-session state persistence synced dynamically with Dashboard and Audit Log.
6. **Screen 5 — Scenario Comparison (`/scenarios`)**:
   * Multi-scenario switcher (Scenario 1: Expiry Wave, Scenario 2: Heatwave Surge, Scenario 3: Inter-Store Rebalancing, Scenario 4: Stale Telemetry Warning).
   * Side-by-side comparison cards: Static Rule Baseline vs. FreshGuard Multi-Agent Engine.
   * Recharts comparative Bar Chart for waste cost, discarded units, and forecast MAE.
7. **Screen 6 — Decision Audit Log (`/audit`)**:
   * Real-time log tracking all manager actions, timestamps, and parameters.
   * Search and decision status filtering (Approved, Edited, Rejected).
   * Dynamic logging of approvals created in Screen 4.

### Completion Criteria Met
* `next build` passes with zero TypeScript errors across all 7 static/dynamic routes.
* All routes respond with HTTP 200 OK on `http://localhost:3000`.
* Interactive review actions cleanly persist across page navigation within browser session.

---

## Batch 3: Backend Integration & Agent Workflow
* **Status**: **PLANNED (NEXT)**
* **Focus**: Connecting Next.js App Router client to live FastAPI backend endpoints and integrating real multi-agent coordination telemetry.

### Deliverables
1. Replace mock fixture service with Axios / Fetch API client pointing to `NEXT_PUBLIC_API_BASE_URL`.
2. Connect `GET /dashboard/summary`, `GET /products`, `GET /products/{id}/risk`.
3. Connect `POST /recommendations/run` and `GET /recommendations`.
4. Connect `PATCH /recommendations/{id}/review` to persist manager decisions to backend SQLite database.
5. Connect `POST /evaluation/run` and `GET /audit`.
6. Add graceful error banners, network reconnect indicators, and skeleton loaders.

---

## Batch 4: Testing & Demo Preparation
* **Status**: **PLANNED**
* **Focus**: Polishing presentation flow across the 6 mandatory hackathon demo scenarios.

---

## Batch 5: Final Handover & Deployment Packaging
* **Status**: **PLANNED**
* **Focus**: Production build audit, deployment guide, and final handover.
