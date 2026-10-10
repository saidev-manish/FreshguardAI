"""
synthetic_data.py
=================
Generates a rich, deterministic synthetic dataset for FreshGuard AI.
Covers: stores, SKUs, sales history (30 days), inventory snapshots,
expiry batches, promotions, weather signals, and event calendars.
All randomness is seeded so results are reproducible across runs.
"""

import random
import datetime
from typing import List, Dict, Any, Optional

# ─── Seed for reproducibility ─────────────────────────────────────────────────
RNG = random.Random(42)

# ─── Reference date (today) ───────────────────────────────────────────────────
TODAY = datetime.date(2026, 10, 10)

# ─── Store catalog ────────────────────────────────────────────────────────────
STORES: List[Dict[str, Any]] = [
    {
        "store_id": "STORE-01",
        "name": "Downtown Supercenter",
        "location_label": "Downtown Metro",
        "region": "metro",
        "cold_storage_capacity_units": 2000,
        "avg_daily_footfall": 1800,
        "active": True,
    },
    {
        "store_id": "STORE-02",
        "name": "Westside Market",
        "location_label": "Westside Suburbs",
        "region": "suburban",
        "cold_storage_capacity_units": 1200,
        "avg_daily_footfall": 950,
        "active": True,
    },
    {
        "store_id": "STORE-03",
        "name": "North Suburban Center",
        "location_label": "North District",
        "region": "suburban",
        "cold_storage_capacity_units": 1400,
        "avg_daily_footfall": 1100,
        "active": True,
    },
]

# ─── SKU catalog ──────────────────────────────────────────────────────────────
SKUS: List[Dict[str, Any]] = [
    # Dairy
    {
        "product_id": "PROD-MLK-001", "sku": "SKU-DAIRY-101",
        "name": "Fresh Whole Organic Milk 1L",
        "category": "Dairy", "unit_cost": 1.45, "unit_price": 2.89,
        "shelf_life_days": 7, "avg_daily_velocity": 22,
        "velocity_std": 3, "weekend_multiplier": 1.15,
        "temp_sensitivity": 0.04,
    },
    {
        "product_id": "PROD-BRD-002", "sku": "SKU-BAKE-204",
        "name": "Artisan Sourdough Loaf 500g",
        "category": "Bakery", "unit_cost": 1.80, "unit_price": 4.50,
        "shelf_life_days": 2, "avg_daily_velocity": 14,
        "velocity_std": 2, "weekend_multiplier": 1.30,
        "temp_sensitivity": 0.0,
    },
    {
        "product_id": "PROD-STR-003", "sku": "SKU-PROD-315",
        "name": "Organic Sweet Strawberries 400g",
        "category": "Produce", "unit_cost": 2.10, "unit_price": 4.99,
        "shelf_life_days": 5, "avg_daily_velocity": 18,
        "velocity_std": 4, "weekend_multiplier": 1.20,
        "temp_sensitivity": 0.06,
    },
    {
        "product_id": "PROD-YOG-004", "sku": "SKU-DAIRY-108",
        "name": "Greek Plain Yogurt 500g",
        "category": "Dairy", "unit_cost": 1.65, "unit_price": 3.49,
        "shelf_life_days": 14, "avg_daily_velocity": 8,
        "velocity_std": 1, "weekend_multiplier": 1.10,
        "temp_sensitivity": 0.02,
    },
    {
        "product_id": "PROD-SLD-005", "sku": "SKU-PROD-402",
        "name": "Baby Spinach & Arugula Blend 250g",
        "category": "Produce", "unit_cost": 1.30, "unit_price": 3.19,
        "shelf_life_days": 6, "avg_daily_velocity": 15,
        "velocity_std": 3, "weekend_multiplier": 1.18,
        "temp_sensitivity": 0.07,
    },
    {
        "product_id": "PROD-SAL-006", "sku": "SKU-MEAT-510",
        "name": "Atlantic Salmon Fillet 300g",
        "category": "Meat", "unit_cost": 4.80, "unit_price": 8.99,
        "shelf_life_days": 3, "avg_daily_velocity": 6,
        "velocity_std": 2, "weekend_multiplier": 1.40,
        "temp_sensitivity": 0.03,
    },
    {
        "product_id": "PROD-UNK-007", "sku": "SKU-PREP-701",
        "name": "Chef Prepared Caesar Salad Bowl",
        "category": "Prepared Foods", "unit_cost": 2.50, "unit_price": 5.49,
        "shelf_life_days": 3, "avg_daily_velocity": 5,
        "velocity_std": 2, "weekend_multiplier": 1.25,
        "temp_sensitivity": 0.02,
    },
    {
        "product_id": "PROD-CHK-008", "sku": "SKU-MEAT-522",
        "name": "Free Range Chicken Breast 500g",
        "category": "Meat", "unit_cost": 3.20, "unit_price": 6.49,
        "shelf_life_days": 4, "avg_daily_velocity": 20,
        "velocity_std": 4, "weekend_multiplier": 1.35,
        "temp_sensitivity": 0.05,
    },
    {
        "product_id": "PROD-CHE-009", "sku": "SKU-DAIRY-213",
        "name": "Aged Cheddar Block 250g",
        "category": "Dairy", "unit_cost": 2.80, "unit_price": 5.99,
        "shelf_life_days": 30, "avg_daily_velocity": 7,
        "velocity_std": 1, "weekend_multiplier": 1.05,
        "temp_sensitivity": 0.01,
    },
    {
        "product_id": "PROD-OJ-010", "sku": "SKU-DRINK-301",
        "name": "Fresh Squeezed Orange Juice 1L",
        "category": "Dairy", "unit_cost": 1.90, "unit_price": 3.99,
        "shelf_life_days": 7, "avg_daily_velocity": 12,
        "velocity_std": 2, "weekend_multiplier": 1.20,
        "temp_sensitivity": 0.03,
    },
    {
        "product_id": "PROD-BAN-011", "sku": "SKU-PROD-501",
        "name": "Organic Bananas 1kg",
        "category": "Produce", "unit_cost": 0.80, "unit_price": 1.99,
        "shelf_life_days": 6, "avg_daily_velocity": 30,
        "velocity_std": 5, "weekend_multiplier": 1.15,
        "temp_sensitivity": 0.08,
    },
    {
        "product_id": "PROD-HUM-012", "sku": "SKU-PREP-710",
        "name": "Roasted Red Pepper Hummus 250g",
        "category": "Prepared Foods", "unit_cost": 1.60, "unit_price": 3.49,
        "shelf_life_days": 10, "avg_daily_velocity": 9,
        "velocity_std": 2, "weekend_multiplier": 1.10,
        "temp_sensitivity": 0.01,
    },
    {
        "product_id": "PROD-TOM-013", "sku": "SKU-PROD-601",
        "name": "Heirloom Tomatoes 500g",
        "category": "Produce", "unit_cost": 1.50, "unit_price": 3.29,
        "shelf_life_days": 7, "avg_daily_velocity": 14,
        "velocity_std": 3, "weekend_multiplier": 1.22,
        "temp_sensitivity": 0.05,
    },
    {
        "product_id": "PROD-EGG-014", "sku": "SKU-DAIRY-305",
        "name": "Free Range Eggs 12-pack",
        "category": "Dairy", "unit_cost": 2.40, "unit_price": 4.79,
        "shelf_life_days": 21, "avg_daily_velocity": 25,
        "velocity_std": 4, "weekend_multiplier": 1.12,
        "temp_sensitivity": 0.01,
    },
    {
        "product_id": "PROD-SUS-015", "sku": "SKU-MEAT-605",
        "name": "Pork Sausages 400g",
        "category": "Meat", "unit_cost": 2.10, "unit_price": 4.29,
        "shelf_life_days": 5, "avg_daily_velocity": 11,
        "velocity_std": 3, "weekend_multiplier": 1.45,
        "temp_sensitivity": 0.04,
    },
]

# ─── Weather calendar ─────────────────────────────────────────────────────────
def _generate_weather_calendar() -> Dict[str, Dict[str, Any]]:
    weather = {}
    baseline_temp = 18.0
    for offset in range(-30, 8):
        date = TODAY + datetime.timedelta(days=offset)
        if -5 <= offset <= -1 or 1 <= offset <= 3:
            temp_delta = RNG.uniform(3.0, 5.5)
        elif offset == 0:
            temp_delta = 1.5
        else:
            temp_delta = RNG.uniform(-2.0, 2.0)
        temp = round(baseline_temp + temp_delta, 1)
        condition = "sunny" if temp > 20 else ("cloudy" if temp > 16 else "rainy")
        weather[date.isoformat()] = {
            "date": date.isoformat(),
            "temp_celsius": temp,
            "condition": condition,
            "humidity_pct": RNG.randint(40, 85),
            "is_forecast": offset >= 0,
        }
    return weather

WEATHER_CALENDAR: Dict[str, Dict[str, Any]] = _generate_weather_calendar()

# ─── Event calendar ───────────────────────────────────────────────────────────
EVENTS: List[Dict[str, Any]] = [
    {
        "event_id": "EVT-001",
        "name": "Weekend Football Match",
        "date": (TODAY + datetime.timedelta(days=2)).isoformat(),
        "footfall_multiplier": 1.30,
        "affected_categories": ["Meat", "Dairy", "Bakery"],
    },
    {
        "event_id": "EVT-002",
        "name": "Harvest Festival Downtown",
        "date": (TODAY + datetime.timedelta(days=5)).isoformat(),
        "footfall_multiplier": 1.50,
        "affected_categories": ["Produce", "Bakery", "Prepared Foods"],
    },
    {
        "event_id": "EVT-003",
        "name": "Weekly Farmers Market (Westside)",
        "date": (TODAY + datetime.timedelta(days=3)).isoformat(),
        "footfall_multiplier": 0.80,
        "affected_categories": ["Produce"],
        "store_ids": ["STORE-02"],
    },
    {
        "event_id": "EVT-004",
        "name": "Monthly Store Anniversary Sale",
        "date": (TODAY + datetime.timedelta(days=4)).isoformat(),
        "footfall_multiplier": 1.20,
        "affected_categories": ["Dairy", "Produce", "Meat", "Bakery", "Prepared Foods"],
    },
]

# ─── Promotions ───────────────────────────────────────────────────────────────
PROMOTIONS: List[Dict[str, Any]] = [
    {
        "promo_id": "PROMO-001",
        "product_id": "PROD-MLK-001",
        "store_id": "STORE-01",
        "start_date": (TODAY - datetime.timedelta(days=10)).isoformat(),
        "end_date": (TODAY - datetime.timedelta(days=8)).isoformat(),
        "discount_pct": 15,
        "type": "WEEKEND_SPECIAL",
    },
    {
        "promo_id": "PROMO-002",
        "product_id": "PROD-CHK-008",
        "store_id": "ALL",
        "start_date": (TODAY - datetime.timedelta(days=5)).isoformat(),
        "end_date": (TODAY - datetime.timedelta(days=3)).isoformat(),
        "discount_pct": 20,
        "type": "SUPPLIER_DEAL",
    },
    {
        "promo_id": "PROMO-003",
        "product_id": "PROD-BAN-011",
        "store_id": "STORE-02",
        "start_date": (TODAY - datetime.timedelta(days=2)).isoformat(),
        "end_date": TODAY.isoformat(),
        "discount_pct": 10,
        "type": "CLEARANCE",
    },
]


def generate_sales_history(
    product_id: str,
    store_id: str,
    days_back: int = 30,
) -> List[Dict[str, Any]]:
    """Generates synthetic daily sales incorporating weather, promos, and events."""
    sku_meta = next((s for s in SKUS if s["product_id"] == product_id), None)
    store_meta = next((s for s in STORES if s["store_id"] == store_id), None)
    if not sku_meta or not store_meta:
        return []

    footfall_ratio = store_meta["avg_daily_footfall"] / 1800
    records = []
    for offset in range(-days_back, 0):
        date = TODAY + datetime.timedelta(days=offset)
        date_str = date.isoformat()
        is_weekend = date.weekday() >= 5

        base = sku_meta["avg_daily_velocity"] * footfall_ratio
        noise = RNG.gauss(0, sku_meta["velocity_std"])
        demand = base + noise

        if is_weekend:
            demand *= sku_meta["weekend_multiplier"]

        weather = WEATHER_CALENDAR.get(date_str, {})
        temp_delta = weather.get("temp_celsius", 18) - 18.0
        demand += demand * sku_meta["temp_sensitivity"] * temp_delta

        promo_active = any(
            p["product_id"] == product_id
            and p["start_date"] <= date_str <= p["end_date"]
            and (p["store_id"] == store_id or p["store_id"] == "ALL")
            for p in PROMOTIONS
        )
        if promo_active:
            demand *= 1.35

        for evt in EVENTS:
            if (
                evt["date"] == date_str
                and sku_meta["category"] in evt["affected_categories"]
                and ("store_ids" not in evt or store_id in evt["store_ids"])
            ):
                demand *= evt["footfall_multiplier"]

        records.append({
            "date": date_str,
            "store_id": store_id,
            "product_id": product_id,
            "units_sold": max(0, int(round(demand))),
            "promotion_active": promo_active,
            "weather_temp": weather.get("temp_celsius"),
            "weekday": date.weekday(),
        })

    return records


def generate_demand_forecast(
    product_id: str,
    store_id: str,
    horizon_days: int = 7,
) -> List[Dict[str, Any]]:
    """Exponential-smoothing forecast for next horizon_days with weather/event context."""
    history = generate_sales_history(product_id, store_id, days_back=14)
    if not history:
        return []

    sales_vals = [h["units_sold"] for h in history]
    alpha = 0.3
    smoothed = sales_vals[0]
    for v in sales_vals[1:]:
        smoothed = alpha * v + (1 - alpha) * smoothed

    sku_meta = next((s for s in SKUS if s["product_id"] == product_id), {})
    store_meta = next((s for s in STORES if s["store_id"] == store_id), {})
    footfall_ratio = store_meta.get("avg_daily_footfall", 1800) / 1800

    forecasts = []
    for offset in range(1, horizon_days + 1):
        date = TODAY + datetime.timedelta(days=offset)
        date_str = date.isoformat()
        pred = smoothed * footfall_ratio

        if date.weekday() >= 5:
            pred *= sku_meta.get("weekend_multiplier", 1.0)

        weather = WEATHER_CALENDAR.get(date_str, {})
        temp_delta = weather.get("temp_celsius", 18.0) - 18.0
        pred += pred * sku_meta.get("temp_sensitivity", 0) * temp_delta

        weather_flag = abs(temp_delta) > 2
        for evt in EVENTS:
            if (
                evt["date"] == date_str
                and sku_meta.get("category") in evt.get("affected_categories", [])
            ):
                pred *= evt["footfall_multiplier"]
                weather_flag = True

        std_est = sku_meta.get("velocity_std", 2) * footfall_ratio
        forecasts.append({
            "date": date_str,
            "predicted_units": round(pred, 1),
            "lower_bound": max(0, round(pred - 1.5 * std_est, 1)),
            "upper_bound": round(pred + 1.5 * std_est, 1),
            "weather_flag": weather_flag,
        })
    return forecasts


def generate_expiry_batches(
    product_id: str,
    store_id: str,
    on_hand_qty: int,
) -> List[Dict[str, Any]]:
    """Creates 1-3 synthetic expiry batches, earliest first."""
    sku_meta = next((s for s in SKUS if s["product_id"] == product_id), {})
    shelf_life = sku_meta.get("shelf_life_days", 7)
    days_to_first = max(0, RNG.randint(0, min(2, shelf_life)))

    batches = []
    remaining = on_hand_qty
    batch_idx = 1
    expire_offset = days_to_first

    while remaining > 0 and batch_idx <= 3:
        expiry_date = TODAY + datetime.timedelta(days=expire_offset)
        qty = min(remaining, max(1, int(remaining * RNG.uniform(0.4, 0.75))))
        batches.append({
            "batch_id": f"BATCH-{product_id.split('-')[1]}-{batch_idx:02d}",
            "product_id": product_id,
            "store_id": store_id,
            "expiry_date": expiry_date.isoformat(),
            "days_remaining": expire_offset,
            "quantity": qty,
        })
        remaining -= qty
        expire_offset += RNG.randint(2, max(3, shelf_life // 2))
        batch_idx += 1

    if remaining > 0 and batches:
        batches[-1]["quantity"] += remaining

    return batches


def generate_inventory_snapshot(store_id: str) -> List[Dict[str, Any]]:
    """Returns current on-hand inventory snapshot for all SKUs at a store."""
    store_meta = next((s for s in STORES if s["store_id"] == store_id), {})
    footfall_ratio = store_meta.get("avg_daily_footfall", 1800) / 1800
    snapshot = []
    for sku in SKUS:
        base_stock = int(sku["avg_daily_velocity"] * sku["shelf_life_days"] * footfall_ratio * 0.7)
        on_hand = max(1, base_stock + RNG.randint(-10, 10))
        batches = generate_expiry_batches(sku["product_id"], store_id, on_hand)
        nearest = min(batches, key=lambda b: b["days_remaining"]) if batches else {}
        snapshot.append({
            "store_id": store_id,
            "product_id": sku["product_id"],
            "sku": sku["sku"],
            "name": sku["name"],
            "category": sku["category"],
            "on_hand_qty": on_hand,
            "unit_cost": sku["unit_cost"],
            "unit_price": sku["unit_price"],
            "shelf_life_days": sku["shelf_life_days"],
            "next_expiry_date": nearest.get("expiry_date", (TODAY + datetime.timedelta(days=7)).isoformat()),
            "days_to_expiry": nearest.get("days_remaining", 7),
            "batches": batches,
        })
    return snapshot


def get_full_dataset() -> Dict[str, Any]:
    """Returns the complete synthetic dataset for all stores."""
    dataset: Dict[str, Any] = {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "reference_date": TODAY.isoformat(),
        "stores": STORES,
        "skus": SKUS,
        "weather": WEATHER_CALENDAR,
        "events": EVENTS,
        "promotions": PROMOTIONS,
        "inventory_by_store": {},
        "sales_history_by_store": {},
        "demand_forecasts_by_store": {},
    }

    for store in STORES:
        sid = store["store_id"]
        dataset["inventory_by_store"][sid] = generate_inventory_snapshot(sid)

        sales: Dict[str, Any] = {}
        forecasts: Dict[str, Any] = {}
        for sku in SKUS:
            pid = sku["product_id"]
            sales[pid] = generate_sales_history(pid, sid, days_back=30)
            forecasts[pid] = generate_demand_forecast(pid, sid, horizon_days=7)

        dataset["sales_history_by_store"][sid] = sales
        dataset["demand_forecasts_by_store"][sid] = forecasts

    return dataset
