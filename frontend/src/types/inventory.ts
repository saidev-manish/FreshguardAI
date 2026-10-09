export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ExpiryCohort {
  batchId: string;
  expiryDate: string;
  quantity: number;
  daysRemaining: number;
}

export interface ProductDemandPoint {
  date: string;
  actualSales?: number;
  predictedSales?: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Dairy' | 'Produce' | 'Bakery' | 'Meat' | 'Prepared Foods';
  storeId: string;
  storeName: string;
  onHandQty: number;
  unitCost: number;
  unitPrice: number;
  shelfLifeDays: number;
  nextExpiryDate: string;
  daysToExpiry: number;
  estimatedDemand7d: number;
  expectedUnsoldQty: number;
  riskLevel: RiskLevel;
  stockoutRisk: boolean;
  recommendedAction: string;
  cohorts: ExpiryCohort[];
  demandHistory: ProductDemandPoint[];
  evidence: string[];
  dataQualityWarning?: string;
}
