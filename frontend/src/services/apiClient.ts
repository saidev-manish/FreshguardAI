import { InventoryItem } from '../types/inventory';
import { Recommendation, RecommendationStatus } from '../types/recommendation';
import { ScenarioComparisonData } from '../types/scenario';
import { AuditEvent } from '../types/audit';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface DashboardSummary {
  high_risk_count: number;
  at_risk_sku_count: number;
  projected_waste_cost: number;
  stockout_risk_count: number;
  data_freshness_timestamp: string;
  currency: string;
}

export interface ReviewActionPayload {
  decision: 'APPROVED' | 'EDITED_APPROVED' | 'REJECTED';
  edited_action?: string;
  edited_quantity?: number;
  edited_discount_pct?: number;
  reviewer_id?: string;
  reviewer_note?: string;
}

export interface ReviewActionResponse {
  recommendation_id: string;
  status: RecommendationStatus;
  review_id: string;
  updated_at: string;
}

export interface CoordinatorRunResponse {
  run_id: string;
  status: string;
  recommendations_count: number;
  agent_findings: Array<{
    agent_name: string;
    status: string;
    summary: string;
    confidence: number;
  }>;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Fallback to generic message
      }
      throw new ApiError(errorMessage, res.status);
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network or connection failure
    throw new ApiError(`Connection failed: Unable to reach FreshGuard API at ${API_BASE_URL}.`, 0);
  }
}

export const apiClient = {
  // Check backend health
  async checkHealth(): Promise<{ status: string; version: string; database: string }> {
    return request('/health');
  },

  // Dashboard summary metrics
  async getDashboardSummary(storeId: string = 'STORE-01'): Promise<DashboardSummary> {
    return request(`/dashboard/summary?store_id=${encodeURIComponent(storeId)}`);
  },

  // List inventory items with filters
  async getProducts(params?: {
    store_id?: string;
    category?: string;
    risk_level?: string;
    search?: string;
  }): Promise<InventoryItem[]> {
    const query = new URLSearchParams();
    if (params?.store_id) query.append('store_id', params.store_id);
    if (params?.category && params.category !== 'ALL') query.append('category', params.category);
    if (params?.risk_level && params.risk_level !== 'ALL') query.append('risk_level', params.risk_level);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const items = await request<any[]>(`/products${queryString}`);

    // Map backend snake_case to frontend camelCase if needed
    return items.map((item) => ({
      id: item.id || item.product_id,
      sku: item.sku,
      name: item.name,
      category: item.category,
      storeId: item.store_id || 'STORE-01',
      storeName: item.store_name || 'Downtown Supercenter',
      onHandQty: item.on_hand_qty,
      unitCost: item.unit_cost,
      unitPrice: item.unit_price,
      shelfLifeDays: item.shelf_life_days,
      nextExpiryDate: item.next_expiry_date,
      daysToExpiry: item.days_to_expiry,
      estimatedDemand7d: item.estimated_demand_7d,
      expectedUnsoldQty: item.expected_unsold_qty,
      riskLevel: item.risk_level,
      stockoutRisk: item.stockout_risk,
      recommendedAction: item.recommended_action,
      cohorts: item.cohorts || [],
      demandHistory: item.demand_history || [],
      evidence: item.evidence || [],
      dataQualityWarning: item.data_quality_warning
    }));
  },

  // Get single product risk telemetry
  async getProductRisk(productId: string): Promise<InventoryItem> {
    const item = await request<any>(`/products/${encodeURIComponent(productId)}/risk`);
    return {
      id: item.id || item.product_id,
      sku: item.sku,
      name: item.name,
      category: item.category,
      storeId: item.store_id || 'STORE-01',
      storeName: item.store_name || 'Downtown Supercenter',
      onHandQty: item.on_hand_qty,
      unitCost: item.unit_cost,
      unitPrice: item.unit_price,
      shelfLifeDays: item.shelf_life_days,
      nextExpiryDate: item.next_expiry_date,
      daysToExpiry: item.days_to_expiry,
      estimatedDemand7d: item.estimated_demand_7d,
      expectedUnsoldQty: item.expected_unsold_qty,
      riskLevel: item.risk_level,
      stockoutRisk: item.stockout_risk,
      recommendedAction: item.recommended_action,
      cohorts: item.cohorts || [],
      demandHistory: item.demand_history || [],
      evidence: item.evidence || [],
      dataQualityWarning: item.data_quality_warning
    };
  },

  // List recommendations
  async getRecommendations(statusFilter?: string): Promise<Recommendation[]> {
    const query = statusFilter && statusFilter !== 'ALL' ? `?status=${encodeURIComponent(statusFilter)}` : '';
    const items = await request<any[]>(`/recommendations${query}`);

    return items.map((r) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      sku: r.sku,
      category: r.category,
      storeId: r.store_id,
      riskLevel: r.risk_level,
      actionType: r.action_type,
      title: r.title,
      details: r.details,
      suggestedQuantity: r.suggested_quantity,
      suggestedDiscountPct: r.suggested_discount_pct,
      timing: r.timing,
      confidence: r.confidence,
      rationale: r.rationale,
      evidence: r.evidence || [],
      tradeoffs: {
        marginImpact: r.tradeoffs?.margin_impact ?? r.tradeoffs?.marginImpact ?? 0,
        avoidedWasteCost: r.tradeoffs?.avoided_waste_cost ?? r.tradeoffs?.avoidedWasteCost ?? 0,
        netEstimatedBenefit: r.tradeoffs?.net_estimated_benefit ?? r.tradeoffs?.netEstimatedBenefit ?? 0
      },
      status: r.status,
      reviewedBy: r.reviewed_by,
      reviewedAt: r.reviewed_at,
      reviewerNotes: r.reviewer_notes
    }));
  },

  // Review recommendation (Approve, Edit, Reject) with SQLite persistence
  async reviewRecommendation(
    recommendationId: string,
    payload: ReviewActionPayload
  ): Promise<ReviewActionResponse> {
    return request<ReviewActionResponse>(
      `/recommendations/${encodeURIComponent(recommendationId)}/review`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    );
  },

  // Trigger Multi-Agent Coordinator Run
  async runCoordinatorAnalysis(storeId: string = 'STORE-01'): Promise<CoordinatorRunResponse> {
    return request<CoordinatorRunResponse>('/recommendations/run', {
      method: 'POST',
      body: JSON.stringify({ store_id: storeId })
    });
  },

  // Execute scenario comparison benchmark
  async runScenarioEvaluation(scenarioId: string): Promise<ScenarioComparisonData> {
    const res = await request<any>('/evaluation/run', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: scenarioId })
    });

    return {
      id: res.id,
      name: res.name,
      description: res.description,
      assumptions: res.assumptions || [],
      observedInputs: {
        totalTrackedUnits: res.observed_inputs?.totalTrackedUnits || 300,
        atRiskUnits: res.observed_inputs?.atRiskUnits || 100,
        averageShelfLifeDays: res.observed_inputs?.averageShelfLifeDays || 2
      },
      baseline: {
        wasteUnits: res.baseline.waste_units,
        wasteCost: res.baseline.waste_cost,
        stockoutIncidents: res.baseline.stockout_incidents,
        interventionCount: res.baseline.intervention_count,
        operatingMargin: res.baseline.operating_margin,
        forecastMAE: res.baseline.forecast_mae
      },
      freshguard: {
        wasteUnits: res.freshguard.waste_units,
        wasteCost: res.freshguard.waste_cost,
        stockoutIncidents: res.freshguard.stockout_incidents,
        interventionCount: res.freshguard.intervention_count,
        operatingMargin: res.freshguard.operating_margin,
        forecastMAE: res.freshguard.forecast_mae
      },
      projectedNetBenefit: res.projected_net_benefit,
      confidenceScore: res.confidence_score,
      dataWarning: res.data_warning
    };
  },

  // Get decision audit log
  async getAuditLogs(statusFilter?: string): Promise<AuditEvent[]> {
    const query = statusFilter && statusFilter !== 'ALL' ? `?status=${encodeURIComponent(statusFilter)}` : '';
    const items = await request<any[]>(`/audit${query}`);

    return items.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      recommendationId: log.recommendation_id,
      productId: log.product_id,
      productName: log.product_name,
      proposedAction: log.proposed_action,
      decision: log.decision,
      status: log.status,
      reviewer: log.reviewer,
      notes: log.notes || '',
      source: log.source || 'FASTAPI_BACKEND'
    }));
  }
};
