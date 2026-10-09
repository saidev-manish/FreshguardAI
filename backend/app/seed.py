import json
import datetime
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from .models import Store, Product, InventorySnapshot, DailySale, RecommendationModel, AuditEventModel

def seed_database():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Store).first():
            print("Database already contains data, skipping seed.")
            return

        print("Seeding initial FreshGuard AI data...")

        # 1. Seed Stores
        stores = [
            Store(store_id="STORE-01", name="Downtown Supercenter", location_label="Downtown Metro", active=True),
            Store(store_id="STORE-02", name="Westside Market", location_label="Westside Suburbs", active=True),
            Store(store_id="STORE-03", name="North Suburban Center", location_label="North District", active=True),
        ]
        db.add_all(stores)

        # 2. Seed Products
        products_data = [
            Product(
                product_id="PROD-MLK-001",
                sku="SKU-DAIRY-101",
                name="Fresh Whole Organic Milk 1L",
                category="Dairy",
                unit_cost=1.45,
                unit_price=2.89,
                shelf_life_days=7
            ),
            Product(
                product_id="PROD-BRD-002",
                sku="SKU-BAKE-204",
                name="Artisan Sourdough Loaf 500g",
                category="Bakery",
                unit_cost=1.80,
                unit_price=4.50,
                shelf_life_days=2
            ),
            Product(
                product_id="PROD-STR-003",
                sku="SKU-PROD-315",
                name="Organic Sweet Strawberries 400g",
                category="Produce",
                unit_cost=2.10,
                unit_price=4.99,
                shelf_life_days=5
            ),
            Product(
                product_id="PROD-YOG-004",
                sku="SKU-DAIRY-108",
                name="Greek Plain Yogurt 500g",
                category="Dairy",
                unit_cost=1.65,
                unit_price=3.49,
                shelf_life_days=14
            ),
            Product(
                product_id="PROD-SLD-005",
                sku="SKU-PROD-402",
                name="Baby Spinach & Arugula Blend 250g",
                category="Produce",
                unit_cost=1.30,
                unit_price=3.19,
                shelf_life_days=6
            ),
            Product(
                product_id="PROD-SAL-006",
                sku="SKU-MEAT-510",
                name="Atlantic Salmon Fillet 300g",
                category="Meat",
                unit_cost=4.80,
                unit_price=8.99,
                shelf_life_days=3
            ),
            Product(
                product_id="PROD-UNK-007",
                sku="SKU-PREP-701",
                name="Chef Prepared Caesar Salad Bowl",
                category="Prepared Foods",
                unit_cost=2.50,
                unit_price=5.49,
                shelf_life_days=3
            ),
        ]
        db.add_all(products_data)

        # 3. Seed Inventory Snapshots
        snapshots = [
            InventorySnapshot(snapshot_id="SNAP-001", store_id="STORE-01", product_id="PROD-MLK-001", recorded_at="2026-10-09 08:00", on_hand_qty=110, next_expiry_date="2026-10-10"),
            InventorySnapshot(snapshot_id="SNAP-002", store_id="STORE-01", product_id="PROD-BRD-002", recorded_at="2026-10-09 08:00", on_hand_qty=38, next_expiry_date="2026-10-09"),
            InventorySnapshot(snapshot_id="SNAP-003", store_id="STORE-01", product_id="PROD-STR-003", recorded_at="2026-10-09 08:00", on_hand_qty=85, next_expiry_date="2026-10-11"),
            InventorySnapshot(snapshot_id="SNAP-004", store_id="STORE-01", product_id="PROD-YOG-004", recorded_at="2026-10-09 08:00", on_hand_qty=60, next_expiry_date="2026-10-18"),
            InventorySnapshot(snapshot_id="SNAP-005", store_id="STORE-01", product_id="PROD-SLD-005", recorded_at="2026-10-09 08:00", on_hand_qty=18, next_expiry_date="2026-10-10"),
            InventorySnapshot(snapshot_id="SNAP-006", store_id="STORE-01", product_id="PROD-SAL-006", recorded_at="2026-10-09 08:00", on_hand_qty=42, next_expiry_date="2026-10-11"),
            InventorySnapshot(snapshot_id="SNAP-007", store_id="STORE-01", product_id="PROD-UNK-007", recorded_at="2026-10-09 08:00", on_hand_qty=25, next_expiry_date="2026-10-10"),
        ]
        db.add_all(snapshots)

        # 4. Seed Recommendations
        recommendations = [
            RecommendationModel(
                recommendation_id="REC-2026-101",
                product_id="PROD-MLK-001",
                store_id="STORE-01",
                risk_level="HIGH",
                action_type="MARKDOWN",
                title="Apply 30% Dynamic Markdown on 65 Units",
                details="Initiate 30% temporary price markdown on Batch M1 expiring Oct 10 to clear 65 excess units before 18:00 cutoff.",
                quantity=65,
                discount_pct=30,
                timing="Immediate (Apply before 12:00 PM shift)",
                confidence=0.92,
                rationale="Projected baseline sales will leave ~68 units unsold. A 30% discount reduces price from $2.89 to $2.02, accelerating velocity by 2.4x while maintaining positive contribution margin above unit cost ($1.45).",
                evidence_json=json.dumps([
                    "Demand model forecasts standard sales of 22 units without price change.",
                    "Unit margin at $2.02 discount is +$0.57/unit vs. -$1.45 full spoilage write-off.",
                    "Nearby competitor pricing for branded milk is $2.49."
                ]),
                tradeoffs_json=json.dumps({
                    "margin_impact": -56.55,
                    "avoided_waste_cost": 98.60,
                    "net_estimated_benefit": 42.05
                }),
                status="PENDING"
            ),
            RecommendationModel(
                recommendation_id="REC-2026-102",
                product_id="PROD-SAL-006",
                store_id="STORE-01",
                risk_level="HIGH",
                action_type="TRANSFER",
                title="Transfer 15 Units to Westside Branch",
                details="Rebalance 15 fillets from Downtown Supercenter to Westside store via scheduled 13:00 refrigerated transfer route.",
                quantity=15,
                discount_pct=0,
                timing="Dispatch at 13:00 (Arrival 13:45)",
                confidence=0.88,
                rationale="Westside store experienced unexpected stockout on fresh fish. Downtown currently holds 22 units above projected 48-hour demand. Transfer recovers full retail margin ($8.99) minus nominal $12 transit cost.",
                evidence_json=json.dumps([
                    "Westside store inventory: 0 units on shelf; daily velocity: 18 units.",
                    "Downtown shelf life remains 2 days; transfer time is only 45 minutes.",
                    "Coordinator verified receiving store cold-storage capacity."
                ]),
                tradeoffs_json=json.dumps({
                    "margin_impact": -12.00,
                    "avoided_waste_cost": 72.00,
                    "net_estimated_benefit": 60.00
                }),
                status="PENDING"
            ),
            RecommendationModel(
                recommendation_id="REC-2026-103",
                product_id="PROD-SLD-005",
                store_id="STORE-01",
                risk_level="HIGH",
                action_type="REPLENISHMENT",
                title="Urgent Purchase Order: Reorder 40 Units",
                details="Submit supplier purchase order for 40 units immediately with guaranteed tomorrow 07:00 AM delivery.",
                quantity=40,
                discount_pct=0,
                timing="Transmit PO before 15:00 supplier cut-off",
                confidence=0.95,
                rationale="On-hand inventory (18 units) will deplete by tomorrow 11:00 AM based on Friday velocity. Failure to reorder will trigger a 2-day stockout during peak weekend grocery volume.",
                evidence_json=json.dumps([
                    "Current stock: 18 units; average Friday demand: 28 units.",
                    "Supplier lead time: 16 hours. Next delivery window: Saturday morning.",
                    "Estimated lost revenue from stockout: $127.60."
                ]),
                tradeoffs_json=json.dumps({
                    "margin_impact": 0.0,
                    "avoided_waste_cost": 0.0,
                    "net_estimated_benefit": 75.60
                }),
                status="PENDING"
            ),
            RecommendationModel(
                recommendation_id="REC-2026-104",
                product_id="PROD-BRD-002",
                store_id="STORE-01",
                risk_level="CRITICAL",
                action_type="MARKDOWN",
                title="50% Flash Evening Markdown",
                details="Apply 50% sticker discount ($2.25) to remaining 24 loaves expiring today at 20:00.",
                quantity=24,
                discount_pct=50,
                timing="Effective immediately",
                confidence=0.90,
                rationale="Loaves cannot be carried over to tomorrow. 50% discount recovers cost ($1.80) with +$0.45 profit per loaf.",
                evidence_json=json.dumps([
                    "Expiry date is today Oct 09.",
                    "Evening discount shelf location attracts commuter traffic between 17:00-19:00."
                ]),
                tradeoffs_json=json.dumps({
                    "margin_impact": -54.00,
                    "avoided_waste_cost": 43.20,
                    "net_estimated_benefit": 10.80
                }),
                status="APPROVED",
                reviewed_by="Store Manager Alex",
                reviewed_at="2026-10-09 10:45 AM",
                reviewer_notes="Approved for 16:00 evening bakery section special."
            ),
            RecommendationModel(
                recommendation_id="REC-2026-105",
                product_id="PROD-YOG-004",
                store_id="STORE-01",
                risk_level="LOW",
                action_type="NO_ACTION",
                title="Maintain Standard Shelf Display",
                details="No price change or replenishment order required for Greek yogurt.",
                quantity=0,
                discount_pct=0,
                timing="Routine inspection on Oct 14",
                confidence=0.98,
                rationale="9 days remaining shelf life with 8 units/day steady velocity. Natural depletion will absorb existing batch.",
                evidence_json=json.dumps([
                    "60 units on shelf; 52 units forecast demand over next 7 days."
                ]),
                tradeoffs_json=json.dumps({
                    "margin_impact": 0.0,
                    "avoided_waste_cost": 0.0,
                    "net_estimated_benefit": 0.0
                }),
                status="APPROVED",
                reviewed_by="Assistant Manager Sarah",
                reviewed_at="2026-10-09 09:15 AM",
                reviewer_notes="Verified during morning inventory walk."
            )
        ]
        db.add_all(recommendations)

        # 5. Seed Audit Events
        audit_events = [
            AuditEventModel(
                event_id="AUD-901",
                entity_type="recommendation",
                entity_id="REC-2026-104",
                event_type="REVIEW_APPROVED",
                actor="Store Manager Alex",
                product_name="Artisan Sourdough Loaf 500g",
                proposed_action="50% Flash Evening Markdown",
                status="APPROVED",
                notes="Approved for 16:00 evening bakery section special.",
                source="FASTAPI_BACKEND",
                created_at="2026-10-09 10:45:12 AM"
            ),
            AuditEventModel(
                event_id="AUD-902",
                entity_type="recommendation",
                entity_id="REC-2026-105",
                event_type="REVIEW_APPROVED",
                actor="Assistant Manager Sarah",
                product_name="Greek Plain Yogurt 500g",
                proposed_action="Maintain Standard Shelf Display",
                status="APPROVED",
                notes="Verified during morning inventory walk.",
                source="FASTAPI_BACKEND",
                created_at="2026-10-09 09:15:40 AM"
            ),
            AuditEventModel(
                event_id="AUD-903",
                entity_type="recommendation",
                entity_id="REC-2026-098",
                event_type="REVIEW_EDITED",
                actor="Store Manager Alex",
                product_name="Artisan Sourdough Loaf 500g",
                proposed_action="30% Morning Markdown",
                status="EDITED",
                notes="Increased discount from 30% to 50% to clear complete evening batch.",
                source="FASTAPI_BACKEND",
                created_at="2026-10-09 08:30:22 AM"
            ),
            AuditEventModel(
                event_id="AUD-904",
                entity_type="recommendation",
                entity_id="REC-2026-089",
                event_type="REVIEW_REJECTED",
                actor="Operations Lead Marcus",
                product_name="Fresh Whole Organic Milk 1L",
                proposed_action="Transfer 40 units to Store 03",
                status="REJECTED",
                notes="Store 03 refrigeration unit undergoing maintenance until Friday.",
                source="FASTAPI_BACKEND",
                created_at="2026-10-08 06:12:05 PM"
            )
        ]
        db.add_all(audit_events)

        db.commit()
        print("Database seeded successfully with initial stores, products, recommendations, and audit records.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
