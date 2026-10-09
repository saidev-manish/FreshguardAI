# FreshGuard AI — 3-Minute Hackathon Presentation Guide & Demo Script

**Target Duration:** 3 minutes (180 seconds)  
**Primary Audience:** Hackathon Judges, Retail Operations Leads, Technical Evaluators  
**Application State:** Connected to live FastAPI SQLite backend (`http://localhost:8000`) or graceful fallback to typed synthetic demo fixtures.

---

## 1. Quick Setup & Startup Commands

Execute these commands before beginning the presentation:

### Step 1: Start the Backend Service (Port 8000)
```powershell
# Open terminal 1 from the repository root:
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
*Verify readiness:* Open `http://127.0.0.1:8000/health` → `{"status": "ok", "database": "sqlite"}`.

### Step 2: Start the Frontend Application (Port 3000)
```powershell
# Open terminal 2 from the frontend directory:
cd frontend
npm run dev
```
*Verify readiness:* Open `http://localhost:3000` in the presentation browser.

---

## 2. Timed Presentation Script (0:00 – 3:00)

| Timestamp | Phase | Screen / Focus | Key Talking Points & Actions |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:25** | **Problem Statement** | Slide / Landing view (`/`) | **"Perishable grocery inventory is a high-stakes balancing act.** Across retail dairy, bakery, and produce, managers face $340B in global annual shrink, forced to choose between stockouts and avoidable landfill waste. Traditional static markdowns happen too late—often 2 hours before closing. FreshGuard AI solves this with agentic decision support combining shelf-life batch tracking, dynamic demand velocity, and strict human approval guardrails." |
| **0:25 – 0:50** | **Operational Dashboard** | Overview Dashboard (`/`) | **"Here is our live manager dashboard.** Notice the top connection badge: we are connected live to our FastAPI service on port 8000 backed by SQLite persistence.<br>At a glance, the store manager sees 7 tracked perishable SKUs, 5 items flagged at high/critical risk, and $348.60 in immediate spoilage exposure. Our risk distribution chart immediately spotlights items expiring today or within 24 hours, giving the manager operational clarity before opening." |
| **0:50 – 1:20** | **Inventory Risk Queue** | Inventory (`/inventory`) → Product Deep Dive (`/inventory/PROD-MLK-001`) | **"Let's drill down into our inventory risk queue.** Navigate to `/inventory` and click on **Fresh Whole Organic Milk 1L (PROD-MLK-001)**.<br>Notice the granular batch telemetry: Batch M1 (70 units) expires tomorrow, but our 7-day velocity model forecasts only 22 units of baseline demand. That creates an expected unsold surplus of 48 units. Rather than relying on guesswork, FreshGuard exposes the empirical evidence: weekday sales velocity plateaus at 21 units/day, necessitating proactive intervention." |
| **1:20 – 1:50** | **Multi-Agent Coordinator Analysis** | Topbar / Presenter Bar | **"Now we run the FreshGuard Multi-Agent Coordinator.** Click **'Run Coordinator Analysis'** in the top bar.<br>In real time, five specialist agents execute: the **Demand Agent** projects sales velocity; the **Freshness Agent** checks cohort shelf-life dates; the **Replenishment Agent** monitors stockout buffers; the **Markdown/Transfer Agent** synthesizes interventions; and the **Constraint Coordinator** enforces logistics feasibility—validating cold chain capacity before proposing any transfer." |
| **1:50 – 2:20** | **Human-in-the-Loop Review** | Recommendations (`/recommendations`) | **"Crucially, FreshGuard AI never executes autonomously without human confirmation.** On `/recommendations`, we see the candidate interventions.<br>Select recommendation **REC-2026-101** (Organic Milk 30% markdown). Click **'Edit Details'**, adjust the suggested quantity from 65 to 60 units, add reviewer note: *'Approved 60 units for afternoon commuter display'*, and click **'Save & Approve'**.<br>The backend atomically commits this decision to SQLite and marks it as server-confirmed." |
| **2:20 – 2:40** | **Audit Trail & Scenario Evaluation** | Audit Log (`/audit`) → Scenarios (`/scenarios`) | **"Every human decision is recorded in an immutable audit trail.** Open `/audit` to verify our decision: timestamped, actor-stamped, and persisted.<br>Next, open `/scenarios` and run **Scenario 1: Near Expiry Wave**. FreshGuard benchmarks our dynamic agent strategy against static retail rules on identical cohorts: reducing waste costs from $142.80 down to $29.40—a **79.4% reduction in spoilage waste** with lower forecast error." |
| **2:40 – 3:00** | **Impact Summary & Closing** | Dashboard / Switcher summary | **"To summarize:** FreshGuard AI delivers verifiable financial savings, protects gross margins, and eliminates perishable waste—not through black-box automation, but through actionable multi-agent intelligence with human oversight. Thank you, and we welcome your questions!" |

---

## 3. Recommended Demo Records & Test Data

To guarantee smooth presentation execution without hitting uninitialized states:

| Step | Recommended Record | Action | Expected Output |
| :--- | :--- | :--- | :--- |
| **Product Inspection** | `PROD-MLK-001` (Fresh Whole Organic Milk) | Open deep-dive page | Shows 2 cohorts (BATCH-M1, BATCH-M2), 7-day demand history, and specific evidence points. |
| **Recommendation Review** | `REC-2026-101` (Milk 30% Markdown) | Click *Edit Details* → adjust qty to 60 → submit | Card updates to `EDITED` status; persisted to database. |
| **Alternative Review** | `REC-2026-103` (Baby Spinach PO) | Click *Approve Action* | Card updates to `APPROVED` status; creates audit event. |
| **Quick Scenario Switch** | `SCENARIO-01` (Near Expiry Wave) | Click *Run Scenario Evaluation* | Returns $29.40 FreshGuard vs $142.80 Baseline (79.4% waste reduction). |
| **Constraint Rejection Scenario** | `SCENARIO-03` (Infeasible Transfer) | Select dropdown → *Run Scenario* | Coordinator constraint flag appears: *Inter-store transfer rejected (Receiving store cold-room at capacity)*. |

---

## 4. Backup Plan: What to Do If the Backend Fails

FreshGuard AI includes built-in graceful degradation:

1. **If the FastAPI server stops or port 8000 is blocked:**
   - The application automatically switches to **Demo Fallback Mode**.
   - An amber status banner will state: *Demo Fallback Mode: Displaying verified local demonstration fixtures.*
   - All 6 screens remain fully functional using verified static typed fixtures (`MOCK_PRODUCTS`, `MOCK_RECOMMENDATIONS`, `MOCK_SCENARIOS`).
   - Recommendations can still be approved, edited, and rejected in local React state.
   - The scenario switcher continues to evaluate all 6 scenarios with synthetic responses.
2. **Talking point if presenting in Demo Mode:**
   - *"As you can see from our data transparency indicator, FreshGuard AI gracefully degrades to synthetic verification fixtures when external store telemetries are offline, ensuring zero operational downtime for retail staff."*
3. **Quick Reconnect:**
   - If the backend is restarted during the demo, click the **"Retry Connection"** button in the dashboard or topbar. The app reconnects to live SQLite without requiring a page reload.

---

## 5. What Claims to AVOID (Honesty Guardrail)

To maintain technical credibility with judges, **never make these unsupported claims**:

1. ❌ **Do NOT claim that FreshGuard AI uses proprietary fine-tuned deep learning models:**
   - *Truth:* The prototype uses deterministic multi-agent rule coordinates, moving-average velocity forecasting, and constraint solvers. Describe it as an *agentic rule coordinator and optimization engine*.
2. ❌ **Do NOT claim that the database is integrated with an enterprise ERP (like SAP or Oracle Retail):**
   - *Truth:* The prototype runs on a standalone local FastAPI service with SQLite database (`freshguard.db`).
3. ❌ **Do NOT claim that markdowns are pushed automatically to electronic shelf labels (ESL):**
   - *Truth:* The system is designed with human-in-the-loop approval guardrails; decisions require manager confirmation.
4. ❌ **Do NOT claim real-world validated financial savings from live grocery chains:**
   - *Truth:* All metrics represent benchmarked scenario simulations derived from standard retail shrinkage literature and project assumptions.

---

## 6. Presenter Checklist Before Pitching

- [ ] FastAPI backend running on `http://127.0.0.1:8000` (terminal 1).
- [ ] Next.js frontend running on `http://localhost:3000` (terminal 2).
- [ ] Browser window sized to 1440px desktop or standard 1080p presentation display.
- [ ] Overview Dashboard loaded with green "FastAPI Live: Connected" badge visible.
- [ ] Scenario Switcher set to default `Scenario 1: Near Expiry`.
- [ ] Browser zoom set to 100% with readable text and charts.
- [ ] Timer or stopwatch set to 2 minutes 50 seconds to ensure closing under the 3-minute limit.
