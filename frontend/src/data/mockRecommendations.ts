import { Recommendation } from '../types/recommendation';

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'REC-2026-101',
    productId: 'PROD-MLK-001',
    productName: 'Fresh Whole Organic Milk 1L',
    sku: 'SKU-DAIRY-101',
    category: 'Dairy',
    storeId: 'STORE-01',
    riskLevel: 'HIGH',
    actionType: 'MARKDOWN',
    title: 'Apply 30% Dynamic Markdown on 65 Units',
    details: 'Initiate 30% temporary price markdown on Batch M1 expiring Oct 10 to clear 65 excess units before 18:00 cutoff.',
    suggestedQuantity: 65,
    suggestedDiscountPct: 30,
    timing: 'Immediate (Apply before 12:00 PM shift)',
    confidence: 0.92,
    rationale: 'Projected baseline sales will leave ~68 units unsold. A 30% discount reduces price from $2.89 to $2.02, accelerating velocity by 2.4x while maintaining positive contribution margin above unit cost ($1.45).',
    evidence: [
      'Demand model forecasts standard sales of 22 units without price change.',
      'Unit margin at $2.02 discount is +$0.57/unit vs. -$1.45 full spoilage write-off.',
      'Nearby competitor pricing for branded milk is $2.49.'
    ],
    tradeoffs: {
      marginImpact: -56.55,
      avoidedWasteCost: 98.60,
      netEstimatedBenefit: 42.05
    },
    status: 'PENDING'
  },
  {
    id: 'REC-2026-102',
    productId: 'PROD-SAL-006',
    productName: 'Atlantic Salmon Fillet 300g',
    sku: 'SKU-MEAT-510',
    category: 'Meat',
    storeId: 'STORE-01',
    riskLevel: 'HIGH',
    actionType: 'TRANSFER',
    title: 'Transfer 15 Units to Westside Branch',
    details: 'Rebalance 15 fillets from Downtown Supercenter to Westside store via scheduled 13:00 refrigerated transfer route.',
    suggestedQuantity: 15,
    targetStoreId: 'STORE-02 (Westside)',
    timing: 'Dispatch at 13:00 (Arrival 13:45)',
    confidence: 0.88,
    rationale: 'Westside store experienced unexpected stockout on fresh fish. Downtown currently holds 22 units above projected 48-hour demand. Transfer recovers full retail margin ($8.99) minus nominal $12 transit cost.',
    evidence: [
      'Westside store inventory: 0 units on shelf; daily velocity: 18 units.',
      'Downtown shelf life remains 2 days; transfer time is only 45 minutes.',
      'Coordinator verified receiving store cold-storage capacity.'
    ],
    tradeoffs: {
      marginImpact: -12.00,
      avoidedWasteCost: 72.00,
      netEstimatedBenefit: 60.00
    },
    status: 'PENDING'
  },
  {
    id: 'REC-2026-103',
    productId: 'PROD-SLD-005',
    productName: 'Baby Spinach & Arugula Blend 250g',
    sku: 'SKU-PROD-402',
    category: 'Produce',
    storeId: 'STORE-01',
    riskLevel: 'HIGH',
    actionType: 'REPLENISHMENT',
    title: 'Urgent Purchase Order: Reorder 40 Units',
    details: 'Submit supplier purchase order for 40 units immediately with guaranteed tomorrow 07:00 AM delivery.',
    suggestedQuantity: 40,
    timing: 'Transmit PO before 15:00 supplier cut-off',
    confidence: 0.95,
    rationale: 'On-hand inventory (18 units) will deplete by tomorrow 11:00 AM based on Friday velocity. Failure to reorder will trigger a 2-day stockout during peak weekend grocery volume.',
    evidence: [
      'Current stock: 18 units; average Friday demand: 28 units.',
      'Supplier lead time: 16 hours. Next delivery window: Saturday morning.',
      'Estimated lost revenue from stockout: $127.60.'
    ],
    tradeoffs: {
      marginImpact: 0,
      avoidedWasteCost: 0,
      netEstimatedBenefit: 75.60
    },
    status: 'PENDING'
  },
  {
    id: 'REC-2026-104',
    productId: 'PROD-BRD-002',
    productName: 'Artisan Sourdough Loaf 500g',
    sku: 'SKU-BAKE-204',
    category: 'Bakery',
    storeId: 'STORE-01',
    riskLevel: 'CRITICAL',
    actionType: 'MARKDOWN',
    title: '50% Flash Evening Markdown',
    details: 'Apply 50% sticker discount ($2.25) to remaining 24 loaves expiring today at 20:00.',
    suggestedQuantity: 24,
    suggestedDiscountPct: 50,
    timing: 'Effective immediately',
    confidence: 0.90,
    rationale: 'Loaves cannot be carried over to tomorrow. 50% discount recovers cost ($1.80) with +$0.45 profit per loaf.',
    evidence: [
      'Expiry date is today Oct 09.',
      'Evening discount shelf location attracts commuter traffic between 17:00-19:00.'
    ],
    tradeoffs: {
      marginImpact: -54.00,
      avoidedWasteCost: 43.20,
      netEstimatedBenefit: 10.80
    },
    status: 'APPROVED',
    reviewedBy: 'Store Manager Alex',
    reviewedAt: '2026-10-09 10:45 AM',
    reviewerNotes: 'Approved for 16:00 evening bakery section special.'
  },
  {
    id: 'REC-2026-105',
    productId: 'PROD-YOG-004',
    productName: 'Greek Plain Yogurt 500g',
    sku: 'SKU-DAIRY-108',
    category: 'Dairy',
    storeId: 'STORE-01',
    riskLevel: 'LOW',
    actionType: 'NO_ACTION',
    title: 'Maintain Standard Shelf Display',
    details: 'No price change or replenishment order required for Greek yogurt.',
    suggestedQuantity: 0,
    timing: 'Routine inspection on Oct 14',
    confidence: 0.98,
    rationale: '9 days remaining shelf life with 8 units/day steady velocity. Natural depletion will absorb existing batch.',
    evidence: [
      '60 units on shelf; 52 units forecast demand over next 7 days.'
    ],
    tradeoffs: {
      marginImpact: 0,
      avoidedWasteCost: 0,
      netEstimatedBenefit: 0
    },
    status: 'APPROVED',
    reviewedBy: 'Assistant Manager Sarah',
    reviewedAt: '2026-10-09 09:15 AM',
    reviewerNotes: 'Verified during morning inventory walk.'
  }
];
