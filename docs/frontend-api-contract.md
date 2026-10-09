# FreshGuard AI — Frontend API Contract Specification

This document establishes the interface contracts between the **React Frontend** (Member 3) and the **FastAPI Backend** (Member 2 & 4). 

> **Contract Rule**: All endpoints documented below are derived directly from the baseline specifications (`01_System_Design_and_Architecture`, `03_Frontend_Specification`, `04_Backend_Specification`, and `05_Database_Design_and_Data_Dictionary`). Any detail not explicitly locked in the documentation is labeled **`[Needs confirmation]`** along with the specific technical question for the backend developer.

---

## Endpoint Index

1. [`GET /health`](#1-get-health) — Service health status
2. [`GET /dashboard/summary`](#2-get-dashboardsummary) — Dashboard KPI totals and risk counts
3. [`GET /products`](#3-get-products) — Inventory list with risk and filter parameters
4. [`GET /products/{id}/risk`](#4-get-productsidrisk) — Product-level risk assessment and evidence
5. [`POST /forecast`](#5-post-forecast) — Run demand projection for selected items
6. [`POST /recommendations/run`](#6-post-recommendationsrun) — Trigger agent workflow & coordinator
7. [`GET /recommendations`](#7-get-recommendations) — Retrieve recommendation queue
8. [`PATCH /recommendations/{id}/review`](#8-patch-recommendationsidreview) — Submit manager approval/edit/rejection
9. [`POST /evaluation/run`](#9-post-evaluationrun) — Compute FreshGuard vs. Baseline evaluation
10. [`GET /audit`](#10-get-audit) — Audit trail and historical decisions
11. [`POST /data/import`](#11-post-dataimport) — CSV dataset import *(Data Ingestion)*

---

### 1. `GET /health`
* **Purpose**: Verifies that the FastAPI backend service is online, operational, and returns API versioning information.
* **Related Frontend Screen**: Global Navbar / Status badge in top header.
* **Implementation Status**: Pending Backend Implementation.
* **Request**:
  * Parameters: None.
  * Headers: Standard `Accept: application/json`.
* **Expected Response**:
  ```json
  {
    "status": "ok",
    "version": "0.1.0",
    "environment": "development"
  }
  ```
  *(Note: `version` and `environment` format `[Needs confirmation]` with backend developer).*
* **Validation**: None.
* **Possible Errors**: `503 Service Unavailable`.
* **Questions for Backend**:
  1. Does the `/health` endpoint also verify SQLite database connectivity and model file availability?

---

### 2. `GET /dashboard/summary`
* **Purpose**: Fetches high-level key performance indicators (KPIs), summary counts of items at risk, total estimated waste cost, and active stockout alerts for a selected store and date.
* **Related Frontend Screen**: Screen 1 — Overview Dashboard.
* **Implementation Status**: Pending Backend Implementation.
* **Request**:
  * Query Parameters:
    * `store_id` (string, optional `[Needs confirmation]`, e.g. `"STORE_01"`).
    * `date` (string `YYYY-MM-DD`, optional `[Needs confirmation]`).
* **Expected Response**:
  ```json
  {
    "high_risk_count": 5,
    "at_risk_sku_count": 12,
    "projected_waste_cost": 420.50,
    "stockout_risk_count": 3,
    "data_freshness_timestamp": "2026-10-09T08:00:00Z",
    "currency": "USD"
  }
  ```
  *(Note: Exact summary key names `[Needs confirmation]`).*
* **Validation**: `store_id` must match existing stores; `date` must be ISO formatted.
* **Possible Errors**: `400 Bad Request` (invalid store/date format), `404 Store Not Found`.
* **Questions for Backend**:
  1. Does `projected_waste_cost` calculate currency units in float or integer cents?
  2. Will summary metrics support multi-store aggregation if `store_id` is omitted?

---

### 3. `GET /products`
* **Purpose**: Retrieves the inventory list across products and stores, including stock levels, next expiry dates, categories, and calculated risk tier.
* **Related Frontend Screen**: Screen 2 — Inventory / Risk Queue.
* **Implementation Status**: Pending Backend Implementation.
* **Request**:
  * Query Parameters:
    * `store_id` (string, optional, filter by store).
    * `category` (string, optional, e.g. `"Dairy"`, `"Produce"`, `"Bakery"`).
    * `risk_level` (string enum, optional: `"HIGH"`, `"MEDIUM"`, `"LOW"`, `"NORMAL"`).
    * `search` (string, optional product name or ID query `[Needs confirmation]`).
    * `page` / `limit` (integer pagination `[Needs confirmation]`).
* **Expected Response**:
  ```json
  [
    {
      "product_id": "MILK_01",
      "store_id": "STORE_01",
      "name": "Fresh Whole Milk 1L",
      "category": "Dairy",
      "on_hand_qty": 100,
      "unit_cost": 1.20,
      "unit_price": 2.49,
      "shelf_life_days": 7,
      "next_expiry_date": "2026-10-10",
      "risk_level": "HIGH",
      "forecast_demand_7d": 40,
      "estimated_excess_qty": 60
    }
  ]
  ```
* **Validation**: Valid `risk_level` enum values.
* **Possible Errors**: `400 Bad Request` (invalid filter parameter).
* **Questions for Backend**:
  1. Are results paginated by default or returned as a full list for the demo size (~50-100 SKUs)?
  2. What is the exact sorting order (e.g. descending by risk level then expiry date)?

---

### 4. `GET /products/{id}/risk`
* **Purpose**: Returns in-depth risk evaluation, historical sales series, expiry cohorts, forecast horizons, and supporting evidence references for a specific product.
* **Related Frontend Screen**: Screen 3 — Product Detail View.
* **Implementation Status**: Pending Backend Implementation.
* **Request**:
  * Path Parameter: `id` (string, e.g. `"MILK_01"`).
  * Query Parameter: `store_id` (string, required or optional `[Needs confirmation]`).
* **Expected Response**:
  ```json
  {
    "product_id": "MILK_01",
    "store_id": "STORE_01",
    "name": "Fresh Whole Milk 1L",
    "risk_level": "HIGH",
    "on_hand_qty": 100,
    "next_expiry_date": "2026-10-10",
    "days_to_expiry": 1,
    "expected_unsold_qty": 60,
    "stockout_risk": false,
    "forecast": {
      "predicted_units_by_day": [20, 20, 18, 15, 14, 12, 10],
      "horizon_days": 7,
      "model_name": "RidgeRegression_v1",
      "mae": 3.2
    },
    "sales_history": [
      { "date": "2026-10-02", "units_sold": 22 },
      { "date": "2026-10-03", "units_sold": 25 }
    ],
    "evidence": [
      "On-hand stock (100) exceeds 1-day forecast (40) by 60 units before expiry.",
      "Lead time to receiving store B is 6 hours with 35 units projected demand."
    ],
    "input_snapshot_id": "SNAP_20261009_001"
  }
  ```
* **Validation**: `id` must exist in database.
* **Possible Errors**: `404 Product Not Found`.
* **Questions for Backend**:
  1. Is `store_id` mandatory in query parameters when querying product risk?
  2. How many days of historical sales are returned (e.g., 14 days, 30 days)?

---

### 5. `POST /forecast`
* **Purpose**: Generates and returns a forward-looking demand projection for selected products and stores.
* **Related Frontend Screen**: Screen 3 (Product Detail) & Screen 5 (Scenario Evaluation).
* **Implementation Status**: Pending Backend Implementation.
* **Request**:
  ```json
  {
    "product_ids": ["MILK_01"],
    "store_id": "STORE_01",
    "horizon_days": 7
  }
  ```
* **Expected Response**:
  ```json
  [
    {
      "product_id": "MILK_01",
      "store_id": "STORE_01",
      "horizon_days": 7,
      "predicted_units_by_day": [20, 20, 18, 15, 14, 12, 10],
      "model_name": "RidgeRegression_v1",
      "model_version": "1.0.0",
      "evaluation_metrics": { "mae": 3.2, "baseline_mae": 5.1 },
      "input_snapshot_id": "SNAP_20261009_001"
    }
  ]
  ```
* **Validation**: `horizon_days` must be between 1 and 30; `product_ids` must not be empty.
* **Possible Errors**: `400 Bad Request`, `422 Unprocessable Entity`.
* **Questions for Backend**:
  1. Can `product_ids` be omitted to trigger forecasts across all active store items?

---

### 6. `POST /recommendations/run`
* **Purpose**: Triggers the multi-agent pipeline (Demand, Freshness, Replenishment, Markdown/Transfer agents) and runs the Constraint Coordinator to generate feasible recommendations.
* **Related Frontend Screen**: Global "Run FreshGuard Analysis" action button.
* **Implementation Status**: Pending Backend Implementation.
* **Request**:
  ```json
  {
    "store_id": "STORE_01",
    "product_ids": ["MILK_01"]
  }
  ```
  *(Note: Request body parameters `[Needs confirmation]`).*
* **Expected Response**:
  ```json
  {
    "run_id": "RUN_20261009_01",
    "recommendations_generated": 1,
    "status": "COMPLETED",
    "recommendations": [
      {
        "recommendation_id": "REC_101",
        "product_id": "MILK_01",
        "store_id": "STORE_01",
        "risk_level": "HIGH",
        "proposed_action": "MARKDOWN",
        "quantity_or_discount": "25% discount on 60 units",
        "timing": "Immediate (Effective 2026-10-09 14:00)",
        "confidence": 0.88,
        "rationale": "High excess stock before tomorrow's expiry cohort. 25% discount projected to clear 50 units with minimal margin loss.",
        "evidence_refs": ["SNAP_20261009_001", "FC_20261009_01"],
        "expected_tradeoffs": {
          "margin_loss": 37.35,
          "avoided_waste_cost": 72.00,
          "net_savings": 34.65
        },
        "status": "PROPOSED"
      }
    ]
  }
  ```
* **Validation**: Valid `store_id`.
* **Possible Errors**: `500 Internal Error` (Coordinator rule failure).
* **Questions for Backend**:
  1. Is this endpoint synchronous or asynchronous (background task / polling)?
  2. For the demo, does it complete within 1-2 seconds?

---

### 7. `GET /recommendations`
* **Purpose**: Lists all active and historical recommendations with optional status and risk filters.
* **Related Frontend Screen**: Screen 4 — Recommendation Review & Queue.
* **Implementation Status**: Pending Backend Implementation.
* **Request**:
  * Query Parameters:
    * `status` (string enum, optional: `"PROPOSED"`, `"APPROVED"`, `"EDITED_APPROVED"`, `"REJECTED"`, `"NEEDS_REVIEW"`).
    * `store_id` (string, optional).
* **Expected Response**:
  ```json
  [
    {
      "recommendation_id": "REC_101",
      "product_id": "MILK_01",
      "store_id": "STORE_01",
      "product_name": "Fresh Whole Milk 1L",
      "risk_level": "HIGH",
      "proposed_action": "MARKDOWN",
      "quantity_or_discount": "25% discount",
      "quantity": 60,
      "discount_pct": 25,
      "timing": "Immediate",
      "confidence": 0.88,
      "rationale": "Excess stock before expiry",
      "status": "PROPOSED",
      "created_at": "2026-10-09T09:30:00Z"
    }
  ]
  ```
* **Validation**: Valid `status` enum filter.
* **Possible Errors**: `400 Bad Request`.
* **Questions for Backend**:
  1. Does the response embed product name or must the frontend look it up via `product_id`?

---

### 8. `PATCH /recommendations/{id}/review`
* **Purpose**: Records a manager's human-in-the-loop decision (**Approve**, **Edit & Approve**, or **Reject**) and persists an audit entry.
* **Related Frontend Screen**: Screen 4 — Recommendation Review Modal.
* **Implementation Status**: Pending Backend Implementation.
* **Request**:
  ```json
  {
    "decision": "APPROVED",
    "edited_action": null,
    "edited_quantity": null,
    "reviewer_id": "MGR_ALEX",
    "reviewer_note": "Approved standard markdown for evening shift."
  }
  ```
  *(Allowed `decision` values: `"APPROVED"`, `"EDITED_APPROVED"`, `"REJECTED"`).*
* **Expected Response**:
  ```json
  {
    "recommendation_id": "REC_101",
    "status": "APPROVED",
    "updated_at": "2026-10-09T10:15:00Z",
    "review_id": "REV_501"
  }
  ```
* **Validation**:
  * `decision` is mandatory and must be one of `APPROVED`, `EDITED_APPROVED`, `REJECTED`.
  * If `decision === "EDITED_APPROVED"`, either `edited_action` or `edited_quantity` must be provided.
  * `reviewer_id` must be non-empty.
* **Possible Errors**: `400 Bad Request`, `404 Recommendation Not Found`, `409 Conflict` (already reviewed).
* **Questions for Backend**:
  1. Can an already approved/rejected recommendation be re-reviewed, or is it immutable?

---

### 9. `POST /evaluation/run`
* **Purpose**: Executes side-by-side simulation comparing FreshGuard AI against standard rule-based / recent-average baselines on an identical test scenario.
* **Related Frontend Screen**: Screen 5 — Scenario Comparison & Metrics.
* **Implementation Status**: Pending Backend Implementation.
* **Request**:
  ```json
  {
    "scenario_id": "SCENARIO_NEAR_EXPIRY_MILK",
    "include_baseline": true
  }
  ```
* **Expected Response**:
  ```json
  {
    "evaluation_id": "EVAL_901",
    "scenario_id": "SCENARIO_NEAR_EXPIRY_MILK",
    "baseline_metrics": {
      "waste_units": 60,
      "waste_cost": 72.00,
      "stockouts": 0,
      "net_margin": 99.60,
      "forecast_mae": 5.1
    },
    "freshguard_metrics": {
      "waste_units": 10,
      "waste_cost": 12.00,
      "stockouts": 0,
      "net_margin": 134.25,
      "forecast_mae": 3.2
    },
    "delta": {
      "waste_cost_reduction_pct": 83.3,
      "net_margin_gain": 34.65
    },
    "created_at": "2026-10-09T10:30:00Z"
  }
  ```
* **Validation**: `scenario_id` must match a configured scenario.
* **Possible Errors**: `404 Scenario Not Found`.
* **Questions for Backend**:
  1. What are the locked scenario IDs available for evaluation (e.g. `SCENARIO_1_EXPIRY`, `SCENARIO_2_STOCKOUT`)?

---

### 10. `GET /audit`
* **Purpose**: Retrieves the append-only event stream of all manager decisions, system evaluations, and recommendation lifecycle events.
* **Related Frontend Screen**: Screen 6 — Decision Audit Log.
* **Implementation Status**: Pending Backend Implementation.
* **Request**:
  * Query Parameters:
    * `limit` (integer, default 50 `[Needs confirmation]`).
    * `entity_type` (string, optional: `"recommendation"`, `"evaluation"` `[Needs confirmation]`).
* **Expected Response**:
  ```json
  [
    {
      "event_id": "EVT_7001",
      "entity_type": "recommendation",
      "entity_id": "REC_101",
      "event_type": "REVIEW_APPROVED",
      "actor": "MGR_ALEX",
      "payload": {
        "action": "MARKDOWN",
        "discount_pct": 25,
        "note": "Approved standard markdown"
      },
      "created_at": "2026-10-09T10:15:00Z"
    }
  ]
  ```
* **Validation**: None.
* **Possible Errors**: None.
* **Questions for Backend**:
  1. What is the schema of `payload` across different `event_type` records?

---

### 11. `POST /data/import`
* **Relevance to Frontend**:
  * In the MVP, Member 1 and Member 4 will primarily seed datasets via scripts.
  * However, providing a simple CSV upload dialog or "Seed Demo Data" button in the frontend settings/header will significantly enhance demonstration flow for hackathon judges.
* **Purpose**: Accepts CSV file or validated tabular records to populate stores, products, daily sales, and inventory snapshots.
* **Request**: `multipart/form-data` with `file: File (CSV)`.
* **Expected Response**:
  ```json
  {
    "status": "success",
    "imported_rows": 120,
    "validation_warnings": []
  }
  ```
* **Questions for Backend**:
  1. Will the backend accept CSV uploads directly, or only pre-seeded data for the demo?
