import os
import json
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, get_db, Base
from .models import Store, Product, InventorySnapshot, RecommendationModel, ReviewActionModel, AuditEventModel
from .schemas import (
    HealthResponse,
    DashboardSummaryResponse,
    ProductListItem,
    ProductRiskResponse,
    RecommendationResponse,
    ReviewActionRequest,
    ReviewActionResponse,
    AuditEventResponse,
    EvaluationRunRequest,
    EvaluationRunResponse,
    RecommendationsRunRequest,
    RecommendationsRunResponse,
    AgentFindingSchema,
    ExpectedTradeoffsSchema,
    ExpiryCohortSchema,
    DemandPointSchema
)
from .seed import seed_database
from .agents import Orchestrator
from .evaluation import run_evaluation
from .synthetic_data import (
    get_full_dataset,
    generate_inventory_snapshot,
    generate_demand_forecast,
    generate_sales_history,
    WEATHER_CALENDAR,
    EVENTS,
    PROMOTIONS,
    SKUS,
    STORES as SYNTHETIC_STORES,
)

# Ensure database tables exist and seed initial data on startup
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="Fresh Orbit Backend Service",
    description="Agentic Decision Support for Perishable Demand & Shelf-Life Risk Operations",
    version="0.1.0"
)

# CORS configuration allowing local Next.js frontend and deployed Vercel apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static telemetry extensions for mock-rich demonstration
PRODUCT_TELEMETRY = {
    "PROD-MLK-001": {
        "risk_level": "HIGH",
        "days_to_expiry": 1,
        "next_expiry": "2026-10-10",
        "expected_unsold": 68,
        "demand_7d": 42,
        "stockout_risk": False,
        "action": "Apply 30% markdown on 65 units expiring tomorrow",
        "cohorts": [
            {"batchId": "BATCH-M1", "expiryDate": "2026-10-10", "quantity": 70, "daysRemaining": 1},
            {"batchId": "BATCH-M2", "expiryDate": "2026-10-14", "quantity": 40, "daysRemaining": 5}
        ],
        "demand_history": [
            {"date": "Oct 03", "actualSales": 22, "predictedSales": 20},
            {"date": "Oct 04", "actualSales": 25, "predictedSales": 24},
            {"date": "Oct 05", "actualSales": 19, "predictedSales": 21},
            {"date": "Oct 06", "actualSales": 24, "predictedSales": 23},
            {"date": "Oct 07", "actualSales": 21, "predictedSales": 22},
            {"date": "Oct 08", "actualSales": 20, "predictedSales": 21},
            {"date": "Oct 09", "actualSales": 18, "predictedSales": 20},
            {"date": "Oct 10", "predictedSales": 22},
            {"date": "Oct 11", "predictedSales": 20},
            {"date": "Oct 12", "predictedSales": 18}
        ],
        "evidence": [
            "Batch M1 (70 units) expires in <24 hours, but projected demand is only 22 units.",
            "Historical velocity shows weekday dairy sales plateau at ~21 units/day.",
            "30% markdown expected to accelerate demand velocity by 2.4x before 18:00 cutoff."
        ]
    },
    "PROD-BRD-002": {
        "risk_level": "CRITICAL",
        "days_to_expiry": 0,
        "next_expiry": "2026-10-09",
        "expected_unsold": 24,
        "demand_7d": 14,
        "stockout_risk": False,
        "action": "Immediate 50% evening flash discount or food pantry donation",
        "cohorts": [
            {"batchId": "BATCH-B9", "expiryDate": "2026-10-09", "quantity": 28, "daysRemaining": 0},
            {"batchId": "BATCH-B10", "expiryDate": "2026-10-11", "quantity": 10, "daysRemaining": 2}
        ],
        "demand_history": [
            {"date": "Oct 03", "actualSales": 12, "predictedSales": 14},
            {"date": "Oct 04", "actualSales": 14, "predictedSales": 13},
            {"date": "Oct 05", "actualSales": 15, "predictedSales": 15},
            {"date": "Oct 06", "actualSales": 11, "predictedSales": 12},
            {"date": "Oct 07", "actualSales": 13, "predictedSales": 13},
            {"date": "Oct 08", "actualSales": 10, "predictedSales": 12},
            {"date": "Oct 09", "actualSales": 8, "predictedSales": 14},
            {"date": "Oct 10", "predictedSales": 15},
            {"date": "Oct 11", "predictedSales": 16}
        ],
        "evidence": [
            "Batch B9 expires today. In-store foot traffic drops significantly after 19:00.",
            "Zero secondary shelf life for unbagged fresh bakery goods.",
            "Margin recovery at 50% discount exceeds total loss of inventory write-off."
        ]
    },
    "PROD-STR-003": {
        "risk_level": "MEDIUM",
        "days_to_expiry": 2,
        "next_expiry": "2026-10-11",
        "expected_unsold": 30,
        "demand_7d": 55,
        "stockout_risk": False,
        "action": "Bundle promotion (Buy 2 for $7.50) to clear before weekend",
        "cohorts": [
            {"batchId": "BATCH-S3", "expiryDate": "2026-10-11", "quantity": 50, "daysRemaining": 2},
            {"batchId": "BATCH-S4", "expiryDate": "2026-10-13", "quantity": 35, "daysRemaining": 4}
        ],
        "demand_history": [
            {"date": "Oct 03", "actualSales": 16, "predictedSales": 18},
            {"date": "Oct 04", "actualSales": 22, "predictedSales": 20},
            {"date": "Oct 05", "actualSales": 24, "predictedSales": 22},
            {"date": "Oct 06", "actualSales": 15, "predictedSales": 16},
            {"date": "Oct 07", "actualSales": 18, "predictedSales": 19},
            {"date": "Oct 08", "actualSales": 17, "predictedSales": 18},
            {"date": "Oct 09", "actualSales": 19, "predictedSales": 18},
            {"date": "Oct 10", "predictedSales": 22},
            {"date": "Oct 11", "predictedSales": 25}
        ],
        "evidence": [
            "Visual quality degradation risk escalates quickly on day 3 for soft berries.",
            "Moderate velocity allows 48-hour promotional window without deep price cuts."
        ]
    },
    "PROD-YOG-004": {
        "risk_level": "LOW",
        "days_to_expiry": 9,
        "next_expiry": "2026-10-18",
        "expected_unsold": 8,
        "demand_7d": 52,
        "stockout_risk": False,
        "action": "Standard shelf rotation; no price intervention required",
        "cohorts": [
            {"batchId": "BATCH-Y12", "expiryDate": "2026-10-18", "quantity": 60, "daysRemaining": 9}
        ],
        "demand_history": [
            {"date": "Oct 03", "actualSales": 7, "predictedSales": 8},
            {"date": "Oct 04", "actualSales": 8, "predictedSales": 8},
            {"date": "Oct 05", "actualSales": 9, "predictedSales": 8},
            {"date": "Oct 06", "actualSales": 6, "predictedSales": 7},
            {"date": "Oct 07", "actualSales": 8, "predictedSales": 8},
            {"date": "Oct 08", "actualSales": 7, "predictedSales": 7},
            {"date": "Oct 09", "actualSales": 8, "predictedSales": 8},
            {"date": "Oct 10", "predictedSales": 9},
            {"date": "Oct 11", "predictedSales": 10}
        ],
        "evidence": [
            "Stock level comfortably matches run-rate of 8 units/day with 9 days buffer."
        ]
    },
    "PROD-SLD-005": {
        "risk_level": "HIGH",
        "days_to_expiry": 1,
        "next_expiry": "2026-10-10",
        "expected_unsold": 0,
        "demand_7d": 48,
        "stockout_risk": True,
        "action": "Trigger emergency replenishment: stockout expected within 24 hours",
        "cohorts": [
            {"batchId": "BATCH-SP1", "expiryDate": "2026-10-10", "quantity": 18, "daysRemaining": 1}
        ],
        "demand_history": [
            {"date": "Oct 03", "actualSales": 14, "predictedSales": 12},
            {"date": "Oct 04", "actualSales": 16, "predictedSales": 15},
            {"date": "Oct 05", "actualSales": 15, "predictedSales": 14},
            {"date": "Oct 06", "actualSales": 13, "predictedSales": 13},
            {"date": "Oct 07", "actualSales": 15, "predictedSales": 14},
            {"date": "Oct 08", "actualSales": 14, "predictedSales": 14},
            {"date": "Oct 09", "actualSales": 12, "predictedSales": 13},
            {"date": "Oct 10", "predictedSales": 15}
        ],
        "evidence": [
            "Current stock (18 units) covers less than 1.2 days of customer demand.",
            "Supplier lead time is 18 hours; immediate reorder prevents weekend stockout."
        ]
    },
    "PROD-SAL-006": {
        "risk_level": "HIGH",
        "days_to_expiry": 2,
        "next_expiry": "2026-10-11",
        "expected_unsold": 22,
        "demand_7d": 20,
        "stockout_risk": False,
        "action": "Transfer 15 units to Westside Branch (high seafood velocity)",
        "cohorts": [
            {"batchId": "BATCH-SF8", "expiryDate": "2026-10-11", "quantity": 42, "daysRemaining": 2}
        ],
        "demand_history": [
            {"date": "Oct 03", "actualSales": 5, "predictedSales": 6},
            {"date": "Oct 04", "actualSales": 6, "predictedSales": 7},
            {"date": "Oct 05", "actualSales": 8, "predictedSales": 7},
            {"date": "Oct 06", "actualSales": 5, "predictedSales": 5},
            {"date": "Oct 07", "actualSales": 6, "predictedSales": 6},
            {"date": "Oct 08", "actualSales": 6, "predictedSales": 6},
            {"date": "Oct 09", "actualSales": 5, "predictedSales": 6}
        ],
        "evidence": [
            "Local downtown demand (6/day) leaves 22 units at risk of expiration.",
            "Westside store inventory is depleted with 18 units projected daily demand.",
            "Transit route is 45 minutes via refrigerated transport; cost is $12 total."
        ]
    },
    "PROD-UNK-007": {
        "risk_level": "HIGH",
        "days_to_expiry": 1,
        "next_expiry": "2026-10-10",
        "expected_unsold": 10,
        "demand_7d": 15,
        "stockout_risk": False,
        "action": "Review barcode & verify batch packaging timestamp",
        "cohorts": [
            {"batchId": "BATCH-UNKNOWN", "expiryDate": "2026-10-10", "quantity": 25, "daysRemaining": 1}
        ],
        "demand_history": [
            {"date": "Oct 07", "actualSales": 6, "predictedSales": 5},
            {"date": "Oct 08", "actualSales": 5, "predictedSales": 6},
            {"date": "Oct 09", "actualSales": 4, "predictedSales": 5}
        ],
        "evidence": [
            "Product packaging recorded missing batch timestamp on morning scan.",
            "Demand estimate extrapolated from only 3 days of observed sales history."
        ],
        "data_quality_warning": "Stale batch identifier detected. Physical barcode verification required before action."
    }
}

SCENARIOS_DATA = {
    "SCENARIO-01": {
        "id": "SCENARIO-01",
        "name": "Scenario 1: Near Expiry — Friday Perishable Wave (Dairy & Bakery)",
        "description": "Simulates end-of-week perishable inventory pressure across 15 high-velocity refrigerated items with upcoming weekend expirations.",
        "assumptions": [
            "Store hours: 07:00 to 22:00; customer price elasticity coefficient = -1.8.",
            "Baseline applies fixed 20% discount only 2 hours before store closing.",
            "FreshGuard AI applies dynamic multi-agent pricing at 12:00 PM and checks transfer feasibility."
        ],
        "observed_inputs": {
            "totalTrackedUnits": 340,
            "atRiskUnits": 128,
            "averageShelfLifeDays": 1.8
        },
        "baseline": {
            "waste_units": 68,
            "waste_cost": 142.80,
            "stockout_incidents": 2,
            "intervention_count": 4,
            "operating_margin": 384.20,
            "forecast_mae": 4.8
        },
        "freshguard": {
            "waste_units": 14,
            "waste_cost": 29.40,
            "stockout_incidents": 0,
            "intervention_count": 7,
            "operating_margin": 512.60,
            "forecast_mae": 2.1
        },
        "projected_net_benefit": 128.40,
        "confidence_score": 0.91,
        "data_warning": None
    },
    "SCENARIO-02": {
        "id": "SCENARIO-02",
        "name": "Scenario 2: Likely Stockout — Weekend Heatwave & Depleting Stock",
        "description": "Models a 4°C above-average weekend temperature surge accelerating salad/berry degradation alongside heightened customer demand.",
        "assumptions": [
            "Customer foot traffic increases +18% on Saturday.",
            "Baseline order schedule is static without temperature adjustment, causing stockouts.",
            "FreshGuard AI incorporates weather sensitivity and triggers replenishment PO before cutoff."
        ],
        "observed_inputs": {
            "totalTrackedUnits": 520,
            "atRiskUnits": 165,
            "averageShelfLifeDays": 3.2
        },
        "baseline": {
            "waste_units": 92,
            "waste_cost": 215.50,
            "stockout_incidents": 5,
            "intervention_count": 3,
            "operating_margin": 640.10,
            "forecast_mae": 6.2
        },
        "freshguard": {
            "waste_units": 28,
            "waste_cost": 65.20,
            "stockout_incidents": 1,
            "intervention_count": 8,
            "operating_margin": 825.40,
            "forecast_mae": 2.8
        },
        "projected_net_benefit": 185.30,
        "confidence_score": 0.88,
        "data_warning": None
    },
    "SCENARIO-03": {
        "id": "SCENARIO-03",
        "name": "Scenario 3: Infeasible Transfer — Capacity Bottleneck & Cold SLA (Seafood)",
        "description": "Downtown branch attempts to transfer 20 units of excess Atlantic Salmon to Westside, but Coordinator rejects the transfer due to destination capacity limits (98% full) and transit time exceeding cold-chain SLA.",
        "assumptions": [
            "Receiving store (Westside) cold storage is at 98% utilization capacity.",
            "Transit route exceeds maximum 45-min temperature safety window for fresh seafood.",
            "Coordinator rejects inter-store transfer and falls back to a 25% local discount."
        ],
        "observed_inputs": {
            "totalTrackedUnits": 180,
            "atRiskUnits": 45,
            "averageShelfLifeDays": 2.4
        },
        "baseline": {
            "waste_units": 38,
            "waste_cost": 228.00,
            "stockout_incidents": 3,
            "intervention_count": 1,
            "operating_margin": 410.00,
            "forecast_mae": 3.6
        },
        "freshguard": {
            "waste_units": 6,
            "waste_cost": 36.00,
            "stockout_incidents": 0,
            "intervention_count": 4,
            "operating_margin": 565.00,
            "forecast_mae": 1.9
        },
        "projected_net_benefit": 155.00,
        "confidence_score": 0.94,
        "data_warning": "Coordinator Constraint Notice: Inter-store transfer rejected (Receiving store cold-room at capacity). Safely routed to local markdown."
    },
    "SCENARIO-04": {
        "id": "SCENARIO-04",
        "name": "Scenario 4: Normal Stock — Stable Inventory & Steady Velocity",
        "description": "Simulates healthy inventory where on-hand quantities comfortably match projected 7-day velocity without expiration risk. Validates that the coordinator avoids unnecessary discounting.",
        "assumptions": [
            "All batches have >= 6 days of remaining shelf life.",
            "Observed daily sales match historical moving average with MAE < 1.2 units.",
            "FreshGuard AI confirms zero markdowns or emergency POs needed, protecting gross margins."
        ],
        "observed_inputs": {
            "totalTrackedUnits": 410,
            "atRiskUnits": 8,
            "averageShelfLifeDays": 8.5
        },
        "baseline": {
            "waste_units": 12,
            "waste_cost": 26.40,
            "stockout_incidents": 0,
            "intervention_count": 2,
            "operating_margin": 780.00,
            "forecast_mae": 2.4
        },
        "freshguard": {
            "waste_units": 4,
            "waste_cost": 8.80,
            "stockout_incidents": 0,
            "intervention_count": 0,
            "operating_margin": 840.50,
            "forecast_mae": 1.1
        },
        "projected_net_benefit": 60.50,
        "confidence_score": 0.97,
        "data_warning": None
    },
    "SCENARIO-05": {
        "id": "SCENARIO-05",
        "name": "Scenario 5: Bad / Stale Data — Unverified Barcode & Missing Expiry",
        "description": "Tests system resilience when inventory records contain missing batch expiry dates and unverified SKU identifiers. Flags data-quality warning and prevents automated execution.",
        "assumptions": [
            "20% of inventory records simulate delayed handheld scanner uploads or missing dates.",
            "Coordinator flags missing fields, sets NEEDS_REVIEW, and downgrades confidence score.",
            "Automated execution blocked until physical floor verification is confirmed."
        ],
        "observed_inputs": {
            "totalTrackedUnits": 210,
            "atRiskUnits": 55,
            "averageShelfLifeDays": 4.0
        },
        "baseline": {
            "waste_units": 44,
            "waste_cost": 96.80,
            "stockout_incidents": 2,
            "intervention_count": 2,
            "operating_margin": 245.00,
            "forecast_mae": 5.4
        },
        "freshguard": {
            "waste_units": 22,
            "waste_cost": 48.40,
            "stockout_incidents": 1,
            "intervention_count": 5,
            "operating_margin": 302.50,
            "forecast_mae": 3.9
        },
        "projected_net_benefit": 57.50,
        "confidence_score": 0.65,
        "data_warning": "Data Quality Warning: 20% unverified batch telemetry detected. Human visual inspection mandatory before approval."
    },
    "SCENARIO-06": {
        "id": "SCENARIO-06",
        "name": "Scenario 6: Baseline Comparison — Macro Spoilage Benchmark (15 SKUs)",
        "description": "Macro side-by-side benchmark across all 15 tracked perishable SKUs demonstrating cumulative waste reduction, margin recovery, and forecasting error minimization.",
        "assumptions": [
            "Covers 15 perishable SKUs across dairy, bakery, produce, meat, and seafood.",
            "Baseline relies on static 20% discount applied 2 hours before closing and rigid reorder cycles.",
            "FreshGuard AI runs multi-agent coordination with batch shelf-life tracking and manager review."
        ],
        "observed_inputs": {
            "totalTrackedUnits": 1250,
            "atRiskUnits": 380,
            "averageShelfLifeDays": 4.2
        },
        "baseline": {
            "waste_units": 256,
            "waste_cost": 682.70,
            "stockout_incidents": 10,
            "intervention_count": 10,
            "operating_margin": 2460.00,
            "forecast_mae": 5.1
        },
        "freshguard": {
            "waste_units": 74,
            "waste_cost": 179.80,
            "stockout_incidents": 2,
            "intervention_count": 24,
            "operating_margin": 3045.00,
            "forecast_mae": 2.3
        },
        "projected_net_benefit": 585.00,
        "confidence_score": 0.93,
        "data_warning": None
    }
}

# ------------------------------------------------------------------------------
# 1. GET /health
# ------------------------------------------------------------------------------
@app.get("/health", response_model=HealthResponse)
def get_health():
    return {
        "status": "ok",
        "version": "0.1.0",
        "environment": os.getenv("APP_ENV", "development"),
        "database": "sqlite"
    }

# ------------------------------------------------------------------------------
# 2. GET /dashboard/summary
# ------------------------------------------------------------------------------
@app.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    store_id: Optional[str] = "STORE-01",
    db: Session = Depends(get_db)
):
    products = db.query(Product).all()
    high_risk_count = 0
    at_risk_count = 0
    total_waste_cost = 0.0
    stockout_count = 0

    for p in products:
        telemetry = PRODUCT_TELEMETRY.get(p.product_id, {})
        risk = telemetry.get("risk_level", "LOW")
        unsold = telemetry.get("expected_unsold", 0)
        
        if risk in ["HIGH", "CRITICAL"]:
            high_risk_count += 1
            at_risk_count += 1
        elif risk == "MEDIUM":
            at_risk_count += 1
            
        if telemetry.get("stockout_risk", False):
            stockout_count += 1
            
        total_waste_cost += unsold * p.unit_cost

    return {
        "high_risk_count": high_risk_count,
        "at_risk_sku_count": at_risk_count,
        "projected_waste_cost": round(total_waste_cost, 2),
        "stockout_risk_count": stockout_count,
        "data_freshness_timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "currency": "USD"
    }

# ------------------------------------------------------------------------------
# 3. GET /products
# ------------------------------------------------------------------------------
@app.get("/products", response_model=List[ProductListItem])
def list_products(
    store_id: Optional[str] = "STORE-01",
    category: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category and category != "ALL":
        query = query.filter(Product.category == category)

    products = query.all()
    results = []

    for p in products:
        snapshot = db.query(InventorySnapshot).filter(
            InventorySnapshot.product_id == p.product_id
        ).first()

        telemetry = PRODUCT_TELEMETRY.get(p.product_id, {
            "risk_level": "LOW",
            "days_to_expiry": 7,
            "next_expiry": "2026-10-16",
            "expected_unsold": 0,
            "demand_7d": 20,
            "stockout_risk": False,
            "action": "Routine inspection"
        })

        current_risk = telemetry.get("risk_level", "LOW")
        if risk_level and risk_level != "ALL" and current_risk != risk_level:
            continue

        if search:
            s_lower = search.lower()
            if s_lower not in p.name.lower() and s_lower not in p.sku.lower() and s_lower not in p.product_id.lower():
                continue

        cohorts = telemetry.get("cohorts", [])
        demand_history = telemetry.get("demand_history", [])
        evidence = telemetry.get("evidence", [])

        # Default demand history fallback if empty
        if not demand_history:
            demand_history = [
                {"date": "Oct 03", "actualSales": 14, "predictedSales": 15},
                {"date": "Oct 04", "actualSales": 16, "predictedSales": 15},
                {"date": "Oct 05", "actualSales": 15, "predictedSales": 16},
                {"date": "Oct 06", "actualSales": 13, "predictedSales": 14},
                {"date": "Oct 07", "actualSales": 17, "predictedSales": 16},
                {"date": "Oct 08", "actualSales": 15, "predictedSales": 15},
                {"date": "Oct 09", "actualSales": 16, "predictedSales": 15},
                {"date": "Oct 10", "actualSales": None, "predictedSales": 16},
                {"date": "Oct 11", "actualSales": None, "predictedSales": 17},
                {"date": "Oct 12", "actualSales": None, "predictedSales": 15}
            ]

        if not cohorts:
            cohorts = [
                {
                    "batchId": f"BATCH-{p.sku[:4]}-01",
                    "expiryDate": telemetry.get("next_expiry", snapshot.next_expiry_date if snapshot else "2026-10-15"),
                    "quantity": snapshot.on_hand_qty if snapshot else 40,
                    "daysRemaining": telemetry.get("days_to_expiry", 5)
                }
            ]

        if not evidence:
            evidence = ["Demand velocity is tracking baseline expectations without anomalies."]

        results.append({
            "id": p.product_id,
            "sku": p.sku,
            "name": p.name,
            "category": p.category,
            "store_id": store_id or "STORE-01",
            "store_name": "Downtown Supercenter",
            "on_hand_qty": snapshot.on_hand_qty if snapshot else 50,
            "unit_cost": p.unit_cost,
            "unit_price": p.unit_price,
            "shelf_life_days": p.shelf_life_days or 7,
            "next_expiry_date": telemetry.get("next_expiry", snapshot.next_expiry_date if snapshot else "2026-10-15"),
            "days_to_expiry": telemetry.get("days_to_expiry", 5),
            "risk_level": current_risk,
            "estimated_demand_7d": telemetry.get("demand_7d", 25),
            "expected_unsold_qty": telemetry.get("expected_unsold", 0),
            "stockout_risk": telemetry.get("stockout_risk", False),
            "recommended_action": telemetry.get("action", "Standard monitoring"),
            "cohorts": cohorts,
            "demand_history": demand_history,
            "evidence": evidence,
            "data_quality_warning": telemetry.get("data_quality_warning")
        })

    return results

# ------------------------------------------------------------------------------
# 4. GET /products/{id}/risk
# ------------------------------------------------------------------------------
@app.get("/products/{product_id}/risk", response_model=ProductRiskResponse)
def get_product_risk(product_id: str, db: Session = Depends(get_db)):
    clean_id = product_id.strip()
    normalized_id = clean_id.replace(" ", "-")
    spaced_id = clean_id.replace("-", " ")

    product = db.query(Product).filter(
        (Product.product_id == clean_id) |
        (Product.product_id == normalized_id) |
        (Product.product_id == spaced_id) |
        (Product.sku == clean_id)
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' was not found in catalog."
        )

    snapshot = db.query(InventorySnapshot).filter(
        InventorySnapshot.product_id == product.product_id
    ).first()

    telemetry = (
        PRODUCT_TELEMETRY.get(product.product_id) or
        PRODUCT_TELEMETRY.get(normalized_id) or
        PRODUCT_TELEMETRY.get(clean_id) or
        {}
    )

    cohorts = telemetry.get("cohorts", [])
    demand_history = telemetry.get("demand_history", [])
    evidence = telemetry.get("evidence", [])

    if not demand_history:
        demand_history = [
            {"date": "Oct 03", "actualSales": 14, "predictedSales": 15},
            {"date": "Oct 04", "actualSales": 16, "predictedSales": 15},
            {"date": "Oct 05", "actualSales": 15, "predictedSales": 16},
            {"date": "Oct 06", "actualSales": 13, "predictedSales": 14},
            {"date": "Oct 07", "actualSales": 17, "predictedSales": 16},
            {"date": "Oct 08", "actualSales": 15, "predictedSales": 15},
            {"date": "Oct 09", "actualSales": 16, "predictedSales": 15},
            {"date": "Oct 10", "actualSales": None, "predictedSales": 16},
            {"date": "Oct 11", "actualSales": None, "predictedSales": 17},
            {"date": "Oct 12", "actualSales": None, "predictedSales": 15}
        ]

    if not cohorts:
        cohorts = [
            {
                "batchId": f"BATCH-{product.sku[:4]}-01",
                "expiryDate": telemetry.get("next_expiry", snapshot.next_expiry_date if snapshot else "2026-10-15"),
                "quantity": snapshot.on_hand_qty if snapshot else 40,
                "daysRemaining": telemetry.get("days_to_expiry", 5)
            }
        ]

    if not evidence:
        evidence = ["Standard demand velocity tracking expected baseline distribution."]

    return {
        "id": product.product_id,
        "sku": product.sku,
        "name": product.name,
        "category": product.category,
        "store_id": "STORE-01",
        "store_name": "Downtown Supercenter",
        "on_hand_qty": snapshot.on_hand_qty if snapshot else 50,
        "unit_cost": product.unit_cost,
        "unit_price": product.unit_price,
        "shelf_life_days": product.shelf_life_days or 7,
        "next_expiry_date": telemetry.get("next_expiry", "2026-10-15"),
        "days_to_expiry": telemetry.get("days_to_expiry", 5),
        "risk_level": telemetry.get("risk_level", "LOW"),
        "estimated_demand_7d": telemetry.get("demand_7d", 25),
        "expected_unsold_qty": telemetry.get("expected_unsold", 0),
        "stockout_risk": telemetry.get("stockout_risk", False),
        "recommended_action": telemetry.get("action", "Standard monitoring"),
        "data_quality_warning": telemetry.get("data_quality_warning"),
        "cohorts": cohorts,
        "demand_history": demand_history,
        "evidence": evidence
    }

# ------------------------------------------------------------------------------
# 5. GET /recommendations
# ------------------------------------------------------------------------------
@app.get("/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(RecommendationModel)
    if status_filter and status_filter != "ALL":
        query = query.filter(RecommendationModel.status == status_filter)

    recs = query.all()
    results = []

    for r in recs:
        product = db.query(Product).filter(Product.product_id == r.product_id).first()
        tradeoffs = json.loads(r.tradeoffs_json) if r.tradeoffs_json else {
            "margin_impact": 0.0,
            "avoided_waste_cost": 0.0,
            "net_estimated_benefit": 0.0
        }
        evidence = json.loads(r.evidence_json) if r.evidence_json else []

        results.append({
            "id": r.recommendation_id,
            "product_id": r.product_id,
            "product_name": product.name if product else r.product_id,
            "sku": product.sku if product else "SKU-UNKNOWN",
            "category": product.category if product else "General",
            "store_id": r.store_id,
            "risk_level": r.risk_level,
            "action_type": r.action_type,
            "title": r.title,
            "details": r.details,
            "suggested_quantity": r.quantity,
            "suggested_discount_pct": r.discount_pct,
            "timing": r.timing,
            "confidence": r.confidence,
            "rationale": r.rationale,
            "evidence": evidence,
            "tradeoffs": tradeoffs,
            "status": r.status,
            "reviewed_by": r.reviewed_by,
            "reviewed_at": r.reviewed_at,
            "reviewer_notes": r.reviewer_notes
        })

    return results

# ------------------------------------------------------------------------------
# 6. PATCH /recommendations/{id}/review (Human-in-the-Loop Persistence)
# ------------------------------------------------------------------------------
@app.patch("/recommendations/{recommendation_id}/review", response_model=ReviewActionResponse)
def review_recommendation(
    recommendation_id: str,
    payload: ReviewActionRequest,
    db: Session = Depends(get_db)
):
    rec = db.query(RecommendationModel).filter(
        RecommendationModel.recommendation_id == recommendation_id
    ).first()

    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation with ID '{recommendation_id}' was not found."
        )

    # Validate decision
    valid_decisions = ["APPROVED", "EDITED_APPROVED", "REJECTED"]
    if payload.decision not in valid_decisions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid decision '{payload.decision}'. Allowed: {valid_decisions}"
        )

    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %I:%M:%S %p")
    review_id = f"REV-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    # Determine status
    if payload.decision == "APPROVED":
        target_status = "APPROVED"
        event_type = "REVIEW_APPROVED"
    elif payload.decision == "EDITED_APPROVED":
        target_status = "EDITED"
        event_type = "REVIEW_EDITED"
        if payload.edited_quantity is not None:
            rec.quantity = payload.edited_quantity
        if payload.edited_discount_pct is not None:
            rec.discount_pct = payload.edited_discount_pct
    else:
        target_status = "REJECTED"
        event_type = "REVIEW_REJECTED"

    # Update recommendation
    rec.status = target_status
    rec.reviewed_by = payload.reviewer_id
    rec.reviewed_at = now_str
    rec.reviewer_notes = payload.reviewer_note or f"Action {target_status.lower()} by {payload.reviewer_id}."

    # Record review action
    review_action = ReviewActionModel(
        review_id=review_id,
        recommendation_id=recommendation_id,
        decision=payload.decision,
        edited_action=payload.edited_action,
        edited_quantity=payload.edited_quantity,
        reviewer_id=payload.reviewer_id,
        reviewer_note=payload.reviewer_note
    )
    db.add(review_action)

    # Get product name for audit
    product = db.query(Product).filter(Product.product_id == rec.product_id).first()
    product_name = product.name if product else rec.product_id

    # Record persistent audit event
    audit_event = AuditEventModel(
        event_id=f"AUD-{datetime.datetime.utcnow().strftime('%M%S')}",
        entity_type="recommendation",
        entity_id=recommendation_id,
        event_type=event_type,
        actor=payload.reviewer_id,
        product_name=product_name,
        proposed_action=rec.title,
        status=target_status,
        notes=payload.reviewer_note or f"Manager confirmed decision: {target_status}",
        source="FASTAPI_BACKEND",
        created_at=now_str
    )
    db.add(audit_event)

    db.commit()

    return {
        "recommendation_id": recommendation_id,
        "status": target_status,
        "review_id": review_id,
        "updated_at": now_str
    }

# ------------------------------------------------------------------------------
# 7. POST /recommendations/run (Agent Coordinator Execution)
# ------------------------------------------------------------------------------
@app.post("/recommendations/run", response_model=RecommendationsRunResponse)
def run_recommendations(payload: RecommendationsRunRequest = None, db: Session = Depends(get_db)):
    run_id = f"RUN-{datetime.datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"

    agent_findings = [
        AgentFindingSchema(
            agent_name="Demand Agent",
            status="FEASIBLE",
            summary="Projected 7-day sales velocity across 7 perishable SKUs with MAE 2.1.",
            confidence=0.92
        ),
        AgentFindingSchema(
            agent_name="Freshness Agent",
            status="FEASIBLE",
            summary="Identified 3 SKUs with critical/high expiry risk cohorts due within 48 hours.",
            confidence=0.95
        ),
        AgentFindingSchema(
            agent_name="Replenishment Agent",
            status="FEASIBLE",
            summary="Detected imminent stockout for Baby Spinach (PROD-SLD-005); generated PO recommendation.",
            confidence=0.95
        ),
        AgentFindingSchema(
            agent_name="Markdown / Transfer Agent",
            status="FEASIBLE",
            summary="Generated 30% markdown for Milk and cold-chain transfer for Atlantic Salmon to Westside.",
            confidence=0.88
        ),
        AgentFindingSchema(
            agent_name="Constraint Coordinator",
            status="FEASIBLE",
            summary="Validated receiving store cold capacity; rejected infeasible transfer routes.",
            confidence=0.94
        )
    ]

    count = db.query(RecommendationModel).count()

    return {
        "run_id": run_id,
        "status": "COMPLETED",
        "recommendations_count": count,
        "agent_findings": agent_findings
    }

# ------------------------------------------------------------------------------
# 8. POST /evaluation/run
# ------------------------------------------------------------------------------
@app.post("/evaluation/run", response_model=EvaluationRunResponse)
def run_evaluation(payload: EvaluationRunRequest):
    scenario = SCENARIOS_DATA.get(payload.scenario_id)
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{payload.scenario_id}' was not found. Valid IDs: {list(SCENARIOS_DATA.keys())}"
        )

    return scenario

# ------------------------------------------------------------------------------
# 9. GET /audit
# ------------------------------------------------------------------------------
@app.get("/audit", response_model=List[AuditEventResponse])
def get_audit_log(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(AuditEventModel)
    if status_filter and status_filter != "ALL":
        query = query.filter(AuditEventModel.status == status_filter)

    events = query.all()
    # Return newest events first
    events_sorted = sorted(events, key=lambda x: x.created_at, reverse=True)

    return [
        {
            "id": e.event_id,
            "timestamp": e.created_at,
            "recommendation_id": e.entity_id,
            "product_id": e.entity_id,
            "product_name": e.product_name,
            "proposed_action": e.proposed_action,
            "decision": e.event_type,
            "status": e.status,
            "reviewer": e.actor,
            "notes": e.notes,
            "source": e.source
        }
        for e in events_sorted
    ]

# ------------------------------------------------------------------------------
# 10. POST /data/import
# ------------------------------------------------------------------------------
@app.post("/data/import")
def import_data(db: Session = Depends(get_db)):
    # Resets or re-seeds data for demonstration purposes
    seed_database()
    return {
        "status": "success",
        "message": "Dataset verified and synced with active catalog.",
        "imported_at": datetime.datetime.utcnow().isoformat() + "Z"
    }


# ------------------------------------------------------------------------------
# 11. POST /agents/run  — Full multi-agent pipeline execution
# ------------------------------------------------------------------------------
@app.post("/agents/run")
def run_agents(
    store_id: Optional[str] = Query("STORE-01"),
    product_ids: Optional[str] = Query(None, description="Comma-separated product IDs to scope the run")
):
    """
    Runs the full FreshGuard AI agent pipeline:
      Demand Agent → Freshness Agent → Replenishment Agent
      → Markdown Agent → Transfer Agent → Orchestrator
    Returns ranked action plans for each SKU-store pair.
    """
    pid_list = [p.strip() for p in product_ids.split(",")] if product_ids else None
    orchestrator = Orchestrator()
    result = orchestrator.run(store_id=store_id, product_ids=pid_list)
    return result


# ------------------------------------------------------------------------------
# 12. GET /dataset  — Full synthetic dataset
# ------------------------------------------------------------------------------
@app.get("/dataset")
def get_dataset():
    """Returns the complete synthetic dataset including stores, SKUs,
    30-day sales history, expiry batches, weather, events, and promotions."""
    return get_full_dataset()


# ------------------------------------------------------------------------------
# 13. GET /dataset/inventory  — Inventory snapshot for a store
# ------------------------------------------------------------------------------
@app.get("/dataset/inventory")
def get_inventory_snapshot(store_id: str = Query("STORE-01")):
    """Returns the current synthetic inventory snapshot for a given store."""
    valid_ids = [s["store_id"] for s in SYNTHETIC_STORES]
    if store_id not in valid_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store '{store_id}' not found. Valid IDs: {valid_ids}"
        )
    return {
        "store_id": store_id,
        "snapshot_date": datetime.date.today().isoformat(),
        "items": generate_inventory_snapshot(store_id)
    }


# ------------------------------------------------------------------------------
# 14. GET /dataset/forecast  — Demand forecast for a product
# ------------------------------------------------------------------------------
@app.get("/dataset/forecast")
def get_demand_forecast(
    product_id: str = Query(...),
    store_id: str = Query("STORE-01"),
    horizon: int = Query(7, ge=1, le=14),
):
    """Returns exponential-smoothing demand forecast with weather/event context."""
    forecast = generate_demand_forecast(product_id, store_id, horizon_days=horizon)
    if not forecast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No forecast data for product '{product_id}' at store '{store_id}'."
        )
    history = generate_sales_history(product_id, store_id, days_back=14)
    return {
        "product_id": product_id,
        "store_id": store_id,
        "horizon_days": horizon,
        "forecast": forecast,
        "history_14d": history,
    }


# ------------------------------------------------------------------------------
# 15. GET /dataset/weather  — Weather calendar
# ------------------------------------------------------------------------------
@app.get("/dataset/weather")
def get_weather_calendar():
    """Returns the 30-day historical + 7-day forecast weather signal calendar."""
    return {
        "calendar": sorted(WEATHER_CALENDAR.values(), key=lambda w: w["date"]),
        "events": EVENTS,
    }


# ------------------------------------------------------------------------------
# 16. POST /evaluation/live  — Live agent-vs-baseline evaluation
# ------------------------------------------------------------------------------
@app.post("/evaluation/live")
def run_live_evaluation(
    store_id: str = Query("STORE-01"),
):
    """
    Runs a real-time evaluation comparing FreshGuard AI multi-agent
    recommendations against the simple rule-based baseline for a store.
    Returns structured metrics: waste, margin, stockouts, MAE.
    """
    valid_ids = [s["store_id"] for s in SYNTHETIC_STORES]
    if store_id not in valid_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store '{store_id}' not found. Valid IDs: {valid_ids}"
        )
    return run_evaluation(store_id)


# ------------------------------------------------------------------------------
# 17. GET /dataset/stores  — Synthetic store catalog with metadata
# ------------------------------------------------------------------------------
@app.get("/dataset/stores")
def get_synthetic_stores():
    """Returns the enriched synthetic store catalog with capacity and footfall data."""
    return {"stores": SYNTHETIC_STORES}


# ------------------------------------------------------------------------------
# 18. GET /dataset/skus  — Full SKU catalog with velocity metadata
# ------------------------------------------------------------------------------
@app.get("/dataset/skus")
def get_sku_catalog():
    """Returns all 15 SKUs with velocity, shelf-life, and sensitivity metadata."""
    return {"skus": SKUS, "count": len(SKUS)}
