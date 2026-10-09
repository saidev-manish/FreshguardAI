'use client';

import React from 'react';
import {
  GitCompare,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function ScenarioComparisonPage() {
  const {
    scenarios,
    selectedScenarioId,
    setSelectedScenarioId,
    runScenarioEvaluation,
    resetScenarioToDefault,
    isEvaluatingScenario,
    evaluationError,
    evaluationSource,
    isLiveMode
  } = useApp();

  const currentScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const chartData = [
    {
      metric: 'Waste Cost ($)',
      Baseline: currentScenario.baseline.wasteCost,
      FreshGuard: currentScenario.freshguard.wasteCost
    },
    {
      metric: 'Waste Units',
      Baseline: currentScenario.baseline.wasteUnits,
      FreshGuard: currentScenario.freshguard.wasteUnits
    },
    {
      metric: 'Stockouts',
      Baseline: currentScenario.baseline.stockoutIncidents,
      FreshGuard: currentScenario.freshguard.stockoutIncidents
    },
    {
      metric: 'Forecast MAE',
      Baseline: currentScenario.baseline.forecastMAE,
      FreshGuard: currentScenario.freshguard.forecastMAE
    }
  ];

  const wasteCostSaved =
    currentScenario.baseline.wasteCost - currentScenario.freshguard.wasteCost;
  const wasteUnitsReduced =
    currentScenario.baseline.wasteUnits - currentScenario.freshguard.wasteUnits;
  const percentWasteReduction = (
    (wasteCostSaved / (currentScenario.baseline.wasteCost || 1)) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scenario Comparison & Impact Benchmark"
        description="Side-by-side evaluation benchmarking traditional static retail rules against the FreshGuard AI Multi-Agent Coordinator on identical scenario cohorts."
        badge={
          isLiveMode
            ? evaluationSource === 'LIVE'
              ? 'Live FastAPI Evaluated'
              : 'Live Backend Ready'
            : 'Synthetic Benchmark'
        }
        actions={
          <div className="flex items-center gap-2">
            {selectedScenarioId !== 'SCENARIO-01' && (
              <button
                onClick={() => resetScenarioToDefault()}
                disabled={isEvaluatingScenario}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
              >
                Reset Default
              </button>
            )}
            <button
              onClick={() => runScenarioEvaluation(selectedScenarioId)}
              disabled={isEvaluatingScenario}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {isEvaluatingScenario ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running Evaluation...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Run Live Evaluation
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Error banner if evaluation failed */}
      {evaluationError && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-rose-900">Scenario Evaluation Error</h4>
            <p className="text-xs text-rose-800 leading-relaxed">{evaluationError}</p>
          </div>
        </div>
      )}

      {/* 6 Scenario Selector Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
            Select Judging Scenario (6 Available):
          </label>
          <span className="text-[11px] font-mono text-slate-500">
            {isLiveMode ? 'POST /evaluation/run (Active)' : 'Local Demo Simulation'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              disabled={isEvaluatingScenario}
              className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                selectedScenarioId === sc.id
                  ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600 text-slate-900 font-semibold shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="font-bold truncate text-[12px]">{sc.name.split(':')[0]}</div>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                {sc.name.split('—')[1] || sc.name.split(':')[1] || sc.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Warning banner if scenario has data quality flags */}
      {currentScenario.dataWarning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-amber-900">Synthetic Data Warning</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {currentScenario.dataWarning}
            </p>
          </div>
        </div>
      )}

      {/* Scenario Details Overview Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{currentScenario.name}</h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {currentScenario.description}
          </p>
        </div>

        {/* Observed Inputs vs Assumptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Observed Scenario Inputs:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Total Tracked:</span>
                <strong className="text-slate-800 font-bold">{currentScenario.observedInputs.totalTrackedUnits} units</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">At-Risk Units:</span>
                <strong className="text-amber-700 font-bold">{currentScenario.observedInputs.atRiskUnits} units</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Avg Shelf-Life:</span>
                <strong className="text-slate-800 font-bold">{currentScenario.observedInputs.averageShelfLifeDays} days</strong>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Modeling Assumptions:
            </span>
            <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
              {currentScenario.assumptions.slice(0, 3).map((asm, i) => (
                <li key={i}>{asm}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Control Group</span>
              <h3 className="text-base font-bold text-slate-800">Static / Rule-Based Baseline</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600">
              Late 20% Markdown
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Spoilage Waste Cost:</span>
              <span className="text-lg font-bold text-rose-600">${currentScenario.baseline.wasteCost.toFixed(2)}</span>
              <span className="text-[11px] text-slate-400 block">{currentScenario.baseline.wasteUnits} discarded units</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Operating Margin:</span>
              <span className="text-lg font-bold text-slate-800">${currentScenario.baseline.operatingMargin.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Stockout Incidents:</span>
              <span className="text-lg font-bold text-amber-700">{currentScenario.baseline.stockoutIncidents}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Forecast Error (MAE):</span>
              <span className="text-lg font-bold text-slate-800">{currentScenario.baseline.forecastMAE} units</span>
            </div>
          </div>
        </div>

        {/* FreshGuard AI Card */}
        <div className="bg-emerald-950 text-white rounded-xl border border-emerald-800 shadow-md p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-800/80">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">FreshGuard AI</span>
              <h3 className="text-base font-bold text-white">Multi-Agent Coordinated Engine</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-800 text-emerald-200">
              Active Optimization
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-900/50 rounded-lg border border-emerald-800">
              <span className="text-emerald-300 block">Spoilage Waste Cost:</span>
              <span className="text-lg font-bold text-emerald-300">${currentScenario.freshguard.wasteCost.toFixed(2)}</span>
              <span className="text-[11px] text-emerald-400 block">{currentScenario.freshguard.wasteUnits} discarded units</span>
            </div>
            <div className="p-3 bg-emerald-900/50 rounded-lg border border-emerald-800">
              <span className="text-emerald-300 block">Operating Margin:</span>
              <span className="text-lg font-bold text-white">${currentScenario.freshguard.operatingMargin.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-emerald-900/50 rounded-lg border border-emerald-800">
              <span className="text-emerald-300 block">Stockout Incidents:</span>
              <span className="text-lg font-bold text-emerald-300">{currentScenario.freshguard.stockoutIncidents}</span>
            </div>
            <div className="p-3 bg-emerald-900/50 rounded-lg border border-emerald-800">
              <span className="text-emerald-300 block">Forecast Error (MAE):</span>
              <span className="text-lg font-bold text-white">{currentScenario.freshguard.forecastMAE} units</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-emerald-200">
            <span>Net Financial Improvement:</span>
            <span className="font-extrabold text-sm text-emerald-300">
              +${wasteCostSaved.toFixed(2)} ({percentWasteReduction}% Waste Reduced)
            </span>
          </div>
        </div>
      </div>

      {/* Comparative Visual Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Side-by-Side Metric Comparison</h3>
            <p className="text-xs text-slate-500">Lower values indicate superior waste reduction and accuracy</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Recharts Benchmark</span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="FreshGuard" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
