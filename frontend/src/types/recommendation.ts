import { RiskLevel } from './inventory';

export type RecommendationActionType = 
  | 'MARKDOWN'
  | 'TRANSFER'
  | 'REPLENISHMENT'
  | 'PRIORITIZE'
  | 'NO_ACTION';

export type RecommendationStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'EDITED'
  | 'REJECTED';

export interface ExpectedTradeoffs {
  marginImpact: number;
  avoidedWasteCost: number;
  netEstimatedBenefit: number;
}

export interface Recommendation {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  storeId: string;
  riskLevel: RiskLevel;
  actionType: RecommendationActionType;
  title: string;
  details: string;
  suggestedQuantity: number;
  suggestedDiscountPct?: number;
  targetStoreId?: string;
  timing: string;
  confidence: number;
  rationale: string;
  evidence: string[];
  tradeoffs: ExpectedTradeoffs;
  status: RecommendationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  editedAction?: string;
  editedQuantity?: number;
  editedDiscountPct?: number;
}
