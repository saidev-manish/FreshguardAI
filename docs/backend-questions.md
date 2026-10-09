# FreshGuard AI — Technical Questions for Backend & Data Teammates

This document tracks technical questions, assumptions, and required interface confirmations between **Frontend (Member 3)** and **Backend / ML / Data Teammates (Members 1, 2, and 4)**.

---

## 1. Questions for Member 2 (Backend & Agents)

### Q1.1: Execution Timing for `/recommendations/run`
* **Context**: In the frontend, the manager clicks "Run FreshGuard Analysis".
* **Question**: Does `POST /recommendations/run` execute synchronously (returning the result within 1-2 seconds), or does it spawn a background job that requires frontend polling?
* **Frontend Recommendation**: For the hackathon demo, a synchronous response returning the generated recommendations array directly is strongly preferred.

### Q1.2: Structure of Agent Findings & Evidence
* **Context**: We want to show how the specialist agents (Demand, Freshness, Replenishment, Markdown/Transfer) arrived at their findings, and why infeasible options were rejected by the Coordinator.
* **Question**: Will `GET /recommendations` or `GET /products/{id}/risk` return individual agent output payloads (e.g. `agent_findings` array), or just the final synthesizer summary?
* **Frontend Recommendation**: Providing an array of `{ agent_name: string, summary: string, confidence: number, status: "FEASIBLE" | "REJECTED", reason?: string }` will allow us to render a compelling multi-agent reasoning panel.

### Q1.3: Immutability of Manager Decisions
* **Context**: When a manager calls `PATCH /recommendations/{id}/review` with `decision: "APPROVED"`, what happens if they subsequently want to change their mind or edit the quantity?
* **Question**: Is a recommendation's status strictly immutable once reviewed, or can it be updated multiple times while creating subsequent audit records in `review_actions`?

### Q1.4: Error Response Schema
* **Context**: When API validation fails (e.g. invalid date or unknown product ID).
* **Question**: Does FastAPI return standard `{ "detail": "..." }` or a structured object with field-level errors?
* **Frontend Recommendation**: Standardizing on `{ "detail": string, "code"?: string }` simplifies frontend toast notifications.

---

## 2. Questions for Member 1 (Data & Forecasting)

### Q2.1: Forecast Horizon & Granularity
* **Context**: The product detail screen displays a demand forecast chart.
* **Question**: Is the forecast horizon locked to 7 days daily granularity (`predicted_units_by_day: number[]`), or can the manager configure arbitrary horizons (e.g. 14 days)?
* **Frontend Assumption**: We assume a default 7-day daily forecast array for the MVP.

### Q2.2: Missing Data & Uncertainty Representation
* **Context**: Demo scenario 5 involves "Bad Data" (missing expiry or stale inventory snapshot).
* **Question**: When data is missing, will the backend return `risk_level: "NEEDS_REVIEW"` with a flag such as `missing_fields: ["next_expiry_date"]`, or will it return an HTTP 422 error?
* **Frontend Recommendation**: Returning a 200 OK with `risk_level: "NEEDS_REVIEW"` and explicit warning metadata allows the UI to display a helpful diagnostic card rather than crashing.

---

## 3. Questions for Member 4 (Database & Integration)

### Q3.1: Seed Data & Scenario Identifiers
* **Context**: Demo scenarios need to be reproducible on demand.
* **Question**: What are the official identifiers for the test scenarios supported by the database seeder?
  * Proposed:
    * `SCENARIO_NORMAL` (Healthy inventory)
    * `SCENARIO_NEAR_EXPIRY` (Excess milk cohort)
    * `SCENARIO_STOCKOUT` (Low inventory high velocity)
    * `SCENARIO_INFEASIBLE_TRANSFER` (Store B lacks demand / transit delay)
    * `SCENARIO_BAD_DATA` (Missing expiry date)
    * `SCENARIO_BASELINE_COMPARISON` (Dual-run evaluation)
* **Action**: Member 4 to confirm these exact scenario IDs in the seed script.

### Q3.2: Seed & Reset Script Command
* **Context**: During live judging rehearsals, we need to reset the database to its pristine state.
* **Question**: What exact terminal command will reset and seed SQLite? (e.g., `python -m backend.seed` or `python scripts/seed_db.py`?)
* **Action**: Document this command in `docs/project-setup.md` once finalized.

### Q3.3: CORS Configuration
* **Context**: The frontend runs at `http://localhost:5173` while FastAPI runs at `http://127.0.0.1:8000`.
* **Question**: Will CORS middleware in `backend/app/main.py` explicitly allow `http://localhost:5173` and `http://127.0.0.1:5173`?
* **Action**: Member 4 to ensure `CORSMiddleware` is configured in FastAPI with `allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"]`.
