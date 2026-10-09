import { InventoryItem } from '../types/inventory';

export const MOCK_PRODUCTS: InventoryItem[] = [
  {
    id: 'PROD-MLK-001',
    sku: 'SKU-DAIRY-101',
    name: 'Fresh Whole Organic Milk 1L',
    category: 'Dairy',
    storeId: 'STORE-01',
    storeName: 'Downtown Supercenter',
    onHandQty: 110,
    unitCost: 1.45,
    unitPrice: 2.89,
    shelfLifeDays: 7,
    nextExpiryDate: '2026-10-10',
    daysToExpiry: 1,
    estimatedDemand7d: 42,
    expectedUnsoldQty: 68,
    riskLevel: 'HIGH',
    stockoutRisk: false,
    recommendedAction: 'Apply 30% markdown on 65 units expiring tomorrow',
    cohorts: [
      { batchId: 'BATCH-M1', expiryDate: '2026-10-10', quantity: 70, daysRemaining: 1 },
      { batchId: 'BATCH-M2', expiryDate: '2026-10-14', quantity: 40, daysRemaining: 5 }
    ],
    demandHistory: [
      { date: 'Oct 03', actualSales: 22, predictedSales: 20 },
      { date: 'Oct 04', actualSales: 25, predictedSales: 24 },
      { date: 'Oct 05', actualSales: 19, predictedSales: 21 },
      { date: 'Oct 06', actualSales: 24, predictedSales: 23 },
      { date: 'Oct 07', actualSales: 21, predictedSales: 22 },
      { date: 'Oct 08', actualSales: 20, predictedSales: 21 },
      { date: 'Oct 09', actualSales: 18, predictedSales: 20 },
      { date: 'Oct 10', predictedSales: 22 },
      { date: 'Oct 11', predictedSales: 20 },
      { date: 'Oct 12', predictedSales: 18 }
    ],
    evidence: [
      'Batch M1 (70 units) expires in <24 hours, but projected demand is only 22 units.',
      'Historical velocity shows weekday dairy sales plateau at ~21 units/day.',
      '30% markdown expected to accelerate demand velocity by 2.4x before 18:00 cutoff.'
    ]
  },
  {
    id: 'PROD-BRD-002',
    sku: 'SKU-BAKE-204',
    name: 'Artisan Sourdough Loaf 500g',
    category: 'Bakery',
    storeId: 'STORE-01',
    storeName: 'Downtown Supercenter',
    onHandQty: 38,
    unitCost: 1.80,
    unitPrice: 4.50,
    shelfLifeDays: 2,
    nextExpiryDate: '2026-10-09',
    daysToExpiry: 0,
    estimatedDemand7d: 14,
    expectedUnsoldQty: 24,
    riskLevel: 'CRITICAL',
    stockoutRisk: false,
    recommendedAction: 'Immediate 50% evening flash discount or food pantry donation',
    cohorts: [
      { batchId: 'BATCH-B9', expiryDate: '2026-10-09', quantity: 28, daysRemaining: 0 },
      { batchId: 'BATCH-B10', expiryDate: '2026-10-11', quantity: 10, daysRemaining: 2 }
    ],
    demandHistory: [
      { date: 'Oct 03', actualSales: 12, predictedSales: 14 },
      { date: 'Oct 04', actualSales: 14, predictedSales: 13 },
      { date: 'Oct 05', actualSales: 15, predictedSales: 15 },
      { date: 'Oct 06', actualSales: 11, predictedSales: 12 },
      { date: 'Oct 07', actualSales: 13, predictedSales: 13 },
      { date: 'Oct 08', actualSales: 10, predictedSales: 12 },
      { date: 'Oct 09', actualSales: 8, predictedSales: 14 },
      { date: 'Oct 10', predictedSales: 15 },
      { date: 'Oct 11', predictedSales: 16 }
    ],
    evidence: [
      'Batch B9 expires today. In-store foot traffic drops significantly after 19:00.',
      'Zero secondary shelf life for unbagged fresh bakery goods.',
      'Margin recovery at 50% discount exceeds total loss of inventory write-off.'
    ]
  },
  {
    id: 'PROD-STR-003',
    sku: 'SKU-PROD-315',
    name: 'Organic Sweet Strawberries 400g',
    category: 'Produce',
    storeId: 'STORE-01',
    storeName: 'Downtown Supercenter',
    onHandQty: 85,
    unitCost: 2.10,
    unitPrice: 4.99,
    shelfLifeDays: 5,
    nextExpiryDate: '2026-10-11',
    daysToExpiry: 2,
    estimatedDemand7d: 55,
    expectedUnsoldQty: 30,
    riskLevel: 'MEDIUM',
    stockoutRisk: false,
    recommendedAction: 'Bundle promotion (Buy 2 for $7.50) to clear before weekend',
    cohorts: [
      { batchId: 'BATCH-S3', expiryDate: '2026-10-11', quantity: 50, daysRemaining: 2 },
      { batchId: 'BATCH-S4', expiryDate: '2026-10-13', quantity: 35, daysRemaining: 4 }
    ],
    demandHistory: [
      { date: 'Oct 03', actualSales: 16, predictedSales: 18 },
      { date: 'Oct 04', actualSales: 22, predictedSales: 20 },
      { date: 'Oct 05', actualSales: 24, predictedSales: 22 },
      { date: 'Oct 06', actualSales: 15, predictedSales: 16 },
      { date: 'Oct 07', actualSales: 18, predictedSales: 19 },
      { date: 'Oct 08', actualSales: 17, predictedSales: 18 },
      { date: 'Oct 09', actualSales: 19, predictedSales: 18 },
      { date: 'Oct 10', predictedSales: 22 },
      { date: 'Oct 11', predictedSales: 25 }
    ],
    evidence: [
      'Visual quality degradation risk escalates quickly on day 3 for soft berries.',
      'Moderate velocity allows 48-hour promotional window without deep price cuts.'
    ]
  },
  {
    id: 'PROD-YOG-004',
    sku: 'SKU-DAIRY-108',
    name: 'Greek Plain Yogurt 500g',
    category: 'Dairy',
    storeId: 'STORE-01',
    storeName: 'Downtown Supercenter',
    onHandQty: 60,
    unitCost: 1.65,
    unitPrice: 3.49,
    shelfLifeDays: 14,
    nextExpiryDate: '2026-10-18',
    daysToExpiry: 9,
    estimatedDemand7d: 52,
    expectedUnsoldQty: 8,
    riskLevel: 'LOW',
    stockoutRisk: false,
    recommendedAction: 'Standard shelf rotation; no price intervention required',
    cohorts: [
      { batchId: 'BATCH-Y12', expiryDate: '2026-10-18', quantity: 60, daysRemaining: 9 }
    ],
    demandHistory: [
      { date: 'Oct 03', actualSales: 7, predictedSales: 8 },
      { date: 'Oct 04', actualSales: 8, predictedSales: 8 },
      { date: 'Oct 05', actualSales: 9, predictedSales: 8 },
      { date: 'Oct 06', actualSales: 6, predictedSales: 7 },
      { date: 'Oct 07', actualSales: 8, predictedSales: 8 },
      { date: 'Oct 08', actualSales: 7, predictedSales: 7 },
      { date: 'Oct 09', actualSales: 8, predictedSales: 8 },
      { date: 'Oct 10', predictedSales: 9 },
      { date: 'Oct 11', predictedSales: 10 }
    ],
    evidence: [
      'Stock level comfortably matches run-rate of 8 units/day with 9 days buffer.'
    ]
  },
  {
    id: 'PROD-SLD-005',
    sku: 'SKU-PROD-402',
    name: 'Baby Spinach & Arugula Blend 250g',
    category: 'Produce',
    storeId: 'STORE-01',
    storeName: 'Downtown Supercenter',
    onHandQty: 18,
    unitCost: 1.30,
    unitPrice: 3.19,
    shelfLifeDays: 6,
    nextExpiryDate: '2026-10-10',
    daysToExpiry: 1,
    estimatedDemand7d: 48,
    expectedUnsoldQty: 0,
    riskLevel: 'HIGH',
    stockoutRisk: true,
    recommendedAction: 'Trigger emergency replenishment: stockout expected within 24 hours',
    cohorts: [
      { batchId: 'BATCH-SP1', expiryDate: '2026-10-10', quantity: 18, daysRemaining: 1 }
    ],
    demandHistory: [
      { date: 'Oct 03', actualSales: 14, predictedSales: 12 },
      { date: 'Oct 04', actualSales: 16, predictedSales: 15 },
      { date: 'Oct 05', actualSales: 15, predictedSales: 14 },
      { date: 'Oct 06', actualSales: 13, predictedSales: 13 },
      { date: 'Oct 07', actualSales: 15, predictedSales: 14 },
      { date: 'Oct 08', actualSales: 14, predictedSales: 14 },
      { date: 'Oct 09', actualSales: 12, predictedSales: 13 },
      { date: 'Oct 10', predictedSales: 15 }
    ],
    evidence: [
      'Current stock (18 units) covers less than 1.2 days of customer demand.',
      'Supplier lead time is 18 hours; immediate reorder prevents weekend stockout.'
    ]
  },
  {
    id: 'PROD-SAL-006',
    sku: 'SKU-MEAT-510',
    name: 'Atlantic Salmon Fillet 300g',
    category: 'Meat',
    storeId: 'STORE-01',
    storeName: 'Downtown Supercenter',
    onHandQty: 42,
    unitCost: 4.80,
    unitPrice: 8.99,
    shelfLifeDays: 3,
    nextExpiryDate: '2026-10-11',
    daysToExpiry: 2,
    estimatedDemand7d: 20,
    expectedUnsoldQty: 22,
    riskLevel: 'HIGH',
    stockoutRisk: false,
    recommendedAction: 'Transfer 15 units to Westside Branch (high seafood velocity)',
    cohorts: [
      { batchId: 'BATCH-SF8', expiryDate: '2026-10-11', quantity: 42, daysRemaining: 2 }
    ],
    demandHistory: [
      { date: 'Oct 03', actualSales: 5, predictedSales: 6 },
      { date: 'Oct 04', actualSales: 6, predictedSales: 7 },
      { date: 'Oct 05', actualSales: 8, predictedSales: 7 },
      { date: 'Oct 06', actualSales: 5, predictedSales: 5 },
      { date: 'Oct 07', actualSales: 6, predictedSales: 6 },
      { date: 'Oct 08', actualSales: 6, predictedSales: 6 },
      { date: 'Oct 09', actualSales: 5, predictedSales: 6 }
    ],
    evidence: [
      'Local downtown demand (6/day) leaves 22 units at risk of expiration.',
      'Westside store inventory is depleted with 18 units projected daily demand.',
      'Transit route is 45 minutes via refrigerated transport; cost is $12 total.'
    ]
  },
  {
    id: 'PROD-UNK-007',
    sku: 'SKU-PREP-701',
    name: 'Chef Prepared Caesar Salad Bowl',
    category: 'Prepared Foods',
    storeId: 'STORE-01',
    storeName: 'Downtown Supercenter',
    onHandQty: 25,
    unitCost: 2.50,
    unitPrice: 5.49,
    shelfLifeDays: 3,
    nextExpiryDate: '2026-10-10',
    daysToExpiry: 1,
    estimatedDemand7d: 15,
    expectedUnsoldQty: 10,
    riskLevel: 'HIGH',
    stockoutRisk: false,
    recommendedAction: 'Review barcode & verify batch packaging timestamp',
    cohorts: [
      { batchId: 'BATCH-UNKNOWN', expiryDate: '2026-10-10', quantity: 25, daysRemaining: 1 }
    ],
    demandHistory: [
      { date: 'Oct 07', actualSales: 6, predictedSales: 5 },
      { date: 'Oct 08', actualSales: 5, predictedSales: 6 },
      { date: 'Oct 09', actualSales: 4, predictedSales: 5 }
    ],
    evidence: [
      'Product packaging recorded missing batch timestamp on morning scan.',
      'Demand estimate extrapolated from only 3 days of observed sales history.'
    ],
    dataQualityWarning: 'Stale batch identifier detected. Physical barcode verification required before action.'
  }
];
