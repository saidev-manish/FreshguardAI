import { ScenarioComparisonData } from '../types/scenario';

export const MOCK_SCENARIOS: ScenarioComparisonData[] = [
  {
    id: 'SCENARIO-01',
    name: 'Scenario 1: Near Expiry — Friday Perishable Wave (Dairy & Bakery)',
    description: 'Simulates end-of-week perishable inventory pressure across 15 high-velocity refrigerated items with upcoming weekend expirations.',
    assumptions: [
      'Store hours: 07:00 to 22:00; customer price elasticity coefficient = -1.8.',
      'Baseline applies fixed 20% discount only 2 hours before store closing.',
      'FreshGuard AI applies dynamic multi-agent pricing at 12:00 PM and checks transfer feasibility.'
    ],
    observedInputs: {
      totalTrackedUnits: 340,
      atRiskUnits: 128,
      averageShelfLifeDays: 1.8
    },
    baseline: {
      wasteUnits: 68,
      wasteCost: 142.80,
      stockoutIncidents: 2,
      interventionCount: 4,
      operatingMargin: 384.20,
      forecastMAE: 4.8
    },
    freshguard: {
      wasteUnits: 14,
      wasteCost: 29.40,
      stockoutIncidents: 0,
      interventionCount: 7,
      operatingMargin: 512.60,
      forecastMAE: 2.1
    },
    projectedNetBenefit: 128.40,
    confidenceScore: 0.91
  },
  {
    id: 'SCENARIO-02',
    name: 'Scenario 2: Likely Stockout — Weekend Heatwave & Depleting Stock',
    description: 'Models a 4°C above-average weekend temperature surge accelerating salad/berry degradation alongside heightened customer demand.',
    assumptions: [
      'Customer foot traffic increases +18% on Saturday.',
      'Baseline order schedule is static without temperature adjustment, causing stockouts.',
      'FreshGuard AI incorporates weather sensitivity and triggers replenishment PO before cutoff.'
    ],
    observedInputs: {
      totalTrackedUnits: 520,
      atRiskUnits: 165,
      averageShelfLifeDays: 3.2
    },
    baseline: {
      wasteUnits: 92,
      wasteCost: 215.50,
      stockoutIncidents: 5,
      interventionCount: 3,
      operatingMargin: 640.10,
      forecastMAE: 6.2
    },
    freshguard: {
      wasteUnits: 28,
      wasteCost: 65.20,
      stockoutIncidents: 1,
      interventionCount: 8,
      operatingMargin: 825.40,
      forecastMAE: 2.8
    },
    projectedNetBenefit: 185.30,
    confidenceScore: 0.88
  },
  {
    id: 'SCENARIO-03',
    name: 'Scenario 3: Infeasible Transfer — Capacity Bottleneck & Cold SLA (Seafood)',
    description: 'Downtown branch attempts to transfer 20 units of excess Atlantic Salmon to Westside, but Coordinator rejects the transfer due to destination capacity limits (98% full) and transit time exceeding cold-chain SLA.',
    assumptions: [
      'Receiving store (Westside) cold storage is at 98% utilization capacity.',
      'Transit route exceeds maximum 45-min temperature safety window for fresh seafood.',
      'Coordinator rejects inter-store transfer and falls back to a 25% local discount.'
    ],
    observedInputs: {
      totalTrackedUnits: 180,
      atRiskUnits: 45,
      averageShelfLifeDays: 2.4
    },
    baseline: {
      wasteUnits: 38,
      wasteCost: 228.00,
      stockoutIncidents: 3,
      interventionCount: 1,
      operatingMargin: 410.00,
      forecastMAE: 3.6
    },
    freshguard: {
      wasteUnits: 6,
      wasteCost: 36.00,
      stockoutIncidents: 0,
      interventionCount: 4,
      operatingMargin: 565.00,
      forecastMAE: 1.9
    },
    projectedNetBenefit: 155.00,
    confidenceScore: 0.94,
    dataWarning: 'Coordinator Constraint Notice: Inter-store transfer rejected (Receiving store cold-room at capacity). Safely routed to local markdown.'
  },
  {
    id: 'SCENARIO-04',
    name: 'Scenario 4: Normal Stock — Stable Inventory & Steady Velocity',
    description: 'Simulates healthy inventory where on-hand quantities comfortably match projected 7-day velocity without expiration risk. Validates that the coordinator avoids unnecessary discounting.',
    assumptions: [
      'All batches have >= 6 days of remaining shelf life.',
      'Observed daily sales match historical moving average with MAE < 1.2 units.',
      'FreshGuard AI confirms zero markdowns or emergency POs needed, protecting gross margins.'
    ],
    observedInputs: {
      totalTrackedUnits: 410,
      atRiskUnits: 8,
      averageShelfLifeDays: 8.5
    },
    baseline: {
      wasteUnits: 12,
      wasteCost: 26.40,
      stockoutIncidents: 0,
      interventionCount: 2,
      operatingMargin: 780.00,
      forecastMAE: 2.4
    },
    freshguard: {
      wasteUnits: 4,
      wasteCost: 8.80,
      stockoutIncidents: 0,
      interventionCount: 0,
      operatingMargin: 840.50,
      forecastMAE: 1.1
    },
    projectedNetBenefit: 60.50,
    confidenceScore: 0.97
  },
  {
    id: 'SCENARIO-05',
    name: 'Scenario 5: Bad / Stale Data — Unverified Barcode & Missing Expiry',
    description: 'Tests system resilience when inventory records contain missing batch expiry dates and unverified SKU identifiers. Flags data-quality warning and prevents automated execution.',
    assumptions: [
      '20% of inventory records simulate delayed handheld scanner uploads or missing dates.',
      'Coordinator flags missing fields, sets NEEDS_REVIEW, and downgrades confidence score.',
      'Automated execution blocked until physical floor verification is confirmed.'
    ],
    observedInputs: {
      totalTrackedUnits: 210,
      atRiskUnits: 55,
      averageShelfLifeDays: 4.0
    },
    baseline: {
      wasteUnits: 44,
      wasteCost: 96.80,
      stockoutIncidents: 2,
      interventionCount: 2,
      operatingMargin: 245.00,
      forecastMAE: 5.4
    },
    freshguard: {
      wasteUnits: 22,
      wasteCost: 48.40,
      stockoutIncidents: 1,
      interventionCount: 5,
      operatingMargin: 302.50,
      forecastMAE: 3.9
    },
    projectedNetBenefit: 57.50,
    confidenceScore: 0.65,
    dataWarning: 'Data Quality Warning: 20% unverified batch telemetry detected. Human visual inspection mandatory before approval.'
  },
  {
    id: 'SCENARIO-06',
    name: 'Scenario 6: Baseline Comparison — Macro Spoilage Benchmark (15 SKUs)',
    description: 'Macro side-by-side benchmark across all 15 tracked perishable SKUs demonstrating cumulative waste reduction, margin recovery, and forecasting error minimization.',
    assumptions: [
      'Covers 15 perishable SKUs across dairy, bakery, produce, meat, and seafood.',
      'Baseline relies on static 20% discount applied 2 hours before closing and rigid reorder cycles.',
      'FreshGuard AI runs multi-agent coordination with batch shelf-life tracking and manager review.'
    ],
    observedInputs: {
      totalTrackedUnits: 1250,
      atRiskUnits: 380,
      averageShelfLifeDays: 4.2
    },
    baseline: {
      wasteUnits: 256,
      wasteCost: 682.70,
      stockoutIncidents: 10,
      interventionCount: 10,
      operatingMargin: 2460.00,
      forecastMAE: 5.1
    },
    freshguard: {
      wasteUnits: 74,
      wasteCost: 179.80,
      stockoutIncidents: 2,
      interventionCount: 24,
      operatingMargin: 3045.00,
      forecastMAE: 2.3
    },
    projectedNetBenefit: 585.00,
    confidenceScore: 0.93
  }
];
