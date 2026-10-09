import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from .database import Base

class Store(Base):
    __tablename__ = "stores"

    store_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location_label = Column(String, nullable=False)
    active = Column(Boolean, default=True)

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    unit_cost = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    shelf_life_days = Column(Integer, nullable=True)

class DailySale(Base):
    __tablename__ = "daily_sales"

    sales_id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(String, ForeignKey("stores.store_id"), index=True)
    product_id = Column(String, ForeignKey("products.product_id"), index=True)
    sales_date = Column(String, nullable=False, index=True)
    units_sold = Column(Integer, nullable=False)
    promotion_flag = Column(Boolean, default=False)

class InventorySnapshot(Base):
    __tablename__ = "inventory_snapshots"

    snapshot_id = Column(String, primary_key=True, index=True)
    store_id = Column(String, ForeignKey("stores.store_id"), index=True)
    product_id = Column(String, ForeignKey("products.product_id"), index=True)
    recorded_at = Column(String, nullable=False)
    on_hand_qty = Column(Integer, nullable=False)
    received_qty = Column(Integer, default=0)
    waste_qty = Column(Integer, default=0)
    next_expiry_date = Column(String, nullable=True)

class RecommendationModel(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(String, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.product_id"), index=True)
    store_id = Column(String, ForeignKey("stores.store_id"), index=True)
    risk_level = Column(String, nullable=False)
    action_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    quantity = Column(Integer, default=0)
    discount_pct = Column(Integer, default=0)
    timing = Column(String, nullable=False)
    confidence = Column(Float, default=0.9)
    rationale = Column(Text, nullable=False)
    evidence_json = Column(Text, nullable=False)
    tradeoffs_json = Column(Text, nullable=False)
    status = Column(String, default="PENDING", index=True)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(String, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ReviewActionModel(Base):
    __tablename__ = "review_actions"

    review_id = Column(String, primary_key=True, index=True)
    recommendation_id = Column(String, ForeignKey("recommendations.recommendation_id"), index=True)
    decision = Column(String, nullable=False)
    edited_action = Column(String, nullable=True)
    edited_quantity = Column(Integer, nullable=True)
    reviewer_id = Column(String, nullable=False)
    reviewer_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditEventModel(Base):
    __tablename__ = "audit_events"

    event_id = Column(String, primary_key=True, index=True)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True)
    actor = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    proposed_action = Column(String, nullable=False)
    status = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    source = Column(String, default="FASTAPI_BACKEND")
    created_at = Column(String, nullable=False)
