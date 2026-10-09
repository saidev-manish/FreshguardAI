export interface ScenarioMetrics {
  wasteUnits: number;
  wasteCost: number;
  stockoutIncidents: number;
  interventionCount: number;
  operatingMargin: number;
  forecastMAE: number;
}

export interface ScenarioComparisonData {
  id: string;
  name: string;
  description: string;
  assumptions: string[];
  observedInputs: {
    totalTrackedUnits: number;
    atRiskUnits: number;
    averageShelfLifeDays: number;
  };
  baseline: ScenarioMetrics;
  freshguard: ScenarioMetrics;
  projectedNetBenefit: number;
  confidenceScore: number;
  dataWarning?: string;
}
