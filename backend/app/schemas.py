from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    database: str

class DashboardSummaryResponse(BaseModel):
    high_risk_count: int
    at_risk_sku_count: int
    projected_waste_cost: float
    stockout_risk_count: int
    data_freshness_timestamp: str
    currency: str = "USD"

class ExpiryCohortSchema(BaseModel):
    batchId: str
    expiryDate: str
    quantity: int
    daysRemaining: int

class DemandPointSchema(BaseModel):
    date: str
    actualSales: Optional[int] = None
    predictedSales: Optional[int] = None

class ProductListItem(BaseModel):
    id: str
    sku: str
    name: str
    category: str
    store_id: str
    store_name: str
    on_hand_qty: int
    unit_cost: float
    unit_price: float
    shelf_life_days: int
    next_expiry_date: str
    days_to_expiry: int
    risk_level: str
    estimated_demand_7d: int
    expected_unsold_qty: int
    stockout_risk: bool
    recommended_action: str
    cohorts: Optional[List[ExpiryCohortSchema]] = []
    demand_history: Optional[List[DemandPointSchema]] = []
    evidence: Optional[List[str]] = []
    data_quality_warning: Optional[str] = None

class ProductRiskResponse(ProductListItem):
    cohorts: List[ExpiryCohortSchema]
    demand_history: List[DemandPointSchema]
    evidence: List[str]

class ExpectedTradeoffsSchema(BaseModel):
    margin_impact: float
    avoided_waste_cost: float
    net_estimated_benefit: float

class RecommendationResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    sku: str
    category: str
    store_id: str
    risk_level: str
    action_type: str
    title: str
    details: str
    suggested_quantity: int
    suggested_discount_pct: Optional[int] = None
    timing: str
    confidence: float
    rationale: str
    evidence: List[str]
    tradeoffs: ExpectedTradeoffsSchema
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    reviewer_notes: Optional[str] = None

class ReviewActionRequest(BaseModel):
    decision: str = Field(..., description="APPROVED, EDITED_APPROVED, or REJECTED")
    edited_action: Optional[str] = None
    edited_quantity: Optional[int] = None
    edited_discount_pct: Optional[int] = None
    reviewer_id: str = "Store Manager Alex"
    reviewer_note: Optional[str] = None

class ReviewActionResponse(BaseModel):
    recommendation_id: str
    status: str
    review_id: str
    updated_at: str

class AuditEventResponse(BaseModel):
    id: str
    timestamp: str
    recommendation_id: str
    product_id: str
    product_name: str
    proposed_action: str
    decision: str
    status: str
    reviewer: str
    notes: Optional[str] = None
    source: str

class EvaluationMetricsSchema(BaseModel):
    waste_units: int
    waste_cost: float
    stockout_incidents: int
    intervention_count: int
    operating_margin: float
    forecast_mae: float

class EvaluationRunRequest(BaseModel):
    scenario_id: str
    include_baseline: bool = True

class EvaluationRunResponse(BaseModel):
    id: str
    name: str
    description: str
    assumptions: List[str]
    observed_inputs: Dict[str, Any]
    baseline: EvaluationMetricsSchema
    freshguard: EvaluationMetricsSchema
    projected_net_benefit: float
    confidence_score: float
    data_warning: Optional[str] = None

class RecommendationsRunRequest(BaseModel):
    store_id: Optional[str] = "STORE-01"
    product_ids: Optional[List[str]] = None

class AgentFindingSchema(BaseModel):
    agent_name: str
    status: str
    summary: str
    confidence: float

class RecommendationsRunResponse(BaseModel):
    run_id: str
    status: str
    recommendations_count: int
    agent_findings: List[AgentFindingSchema]
