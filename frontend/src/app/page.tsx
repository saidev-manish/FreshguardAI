'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/ui/MetricCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { QuickScenarioSwitcher } from '../components/ui/QuickScenarioSwitcher';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const { products, recommendations, isLiveMode, backendError, retryBackendConnection } = useApp();

  const highRiskProducts = products.filter(
    (p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL'
  );
  const expiringSoonCount = products.filter((p) => p.daysToExpiry <= 1).length;
  const pendingRecs = recommendations.filter((r) => r.status === 'PENDING');

  // Compute total simulated waste exposure ($)
  const totalWasteExposure = products.reduce((acc, p) => {
    return acc + p.expectedUnsoldQty * p.unitCost;
  }, 0);

  // Chart 1 data: Risk Tier Distribution
  const riskDistribution = [
    { name: 'Critical', value: products.filter((p) => p.riskLevel === 'CRITICAL').length, color: '#e11d48' },
    { name: 'High Risk', value: products.filter((p) => p.riskLevel === 'HIGH').length, color: '#f59e0b' },
    { name: 'Medium Risk', value: products.filter((p) => p.riskLevel === 'MEDIUM').length, color: '#eab308' },
    { name: 'Low Risk', value: products.filter((p) => p.riskLevel === 'LOW').length, color: '#10b981' }
  ].filter((d) => d.value > 0);

  // Chart 2 data: Expiry Timeline (Days remaining)
  const expiryTimelineData = [
    { range: 'Today (0d)', count: products.filter((p) => p.daysToExpiry === 0).length, fill: '#e11d48' },
    { range: '1 Day', count: products.filter((p) => p.daysToExpiry === 1).length, fill: '#f59e0b' },
    { range: '2 Days', count: products.filter((p) => p.daysToExpiry === 2).length, fill: '#eab308' },
    { range: '3-5 Days', count: products.filter((p) => p.daysToExpiry >= 3 && p.daysToExpiry <= 5).length, fill: '#3b82f6' },
    { range: '6+ Days', count: products.filter((p) => p.daysToExpiry >= 6).length, fill: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview Dashboard"
        description="Real-time perishable inventory health, spoilage exposure modeling, and coordinated agent recommendations."
        badge={isLiveMode ? "FastAPI Live Data" : "Demo Mode Fixtures"}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/inventory"
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              View All SKUs
            </Link>
            <Link
              href="/recommendations"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              Review Actions ({pendingRecs.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        }
      />

      {/* Backend connection banner */}
      {isLiveMode ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Live Telemetry Connected:</strong> Serving active products and recommendations from FastAPI SQLite database (`freshguard.db`).
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
            PORT: 8000
          </span>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Demo Fallback Mode:</strong> Backend service is unreachable. Displaying verified local demonstration fixtures.
            </span>
          </div>
          <button
            onClick={() => retryBackendConnection()}
            className="px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 font-semibold text-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          title="Tracked SKUs"
          value={products.length}
          subtitle="All active perishables"
          icon={Package}
        />
        <MetricCard
          title="High / Critical"
          value={highRiskProducts.length}
          subtitle="Require intervention"
          icon={AlertTriangle}
          badge={`${highRiskProducts.length} flagged`}
          badgeType="danger"
        />
        <MetricCard
          title="Expiring ≤ 24h"
          value={expiringSoonCount}
          subtitle="Immediate markdowns"
          icon={Clock}
          badge="Urgent Cohorts"
          badgeType="warning"
        />
        <MetricCard
          title="Waste Exposure"
          value={`$${totalWasteExposure.toFixed(2)}`}
          subtitle="Est. at-risk inventory value"
          icon={DollarSign}
        />
        <MetricCard
          title="Pending Actions"
          value={pendingRecs.length}
          subtitle="Manager review queue"
          icon={Sparkles}
          badge={`${pendingRecs.length} actionable`}
          badgeType="success"
        />
      </div>

      {/* Visual Analytics Charts Row (Up front & visible on page open without scrolling) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Risk Breakdown Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Inventory Risk Distribution</h2>
              <p className="text-xs text-slate-500">Breakdown of SKUs across verified risk categories</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Total: {products.length} Items
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }: any) => `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`}
                >
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} SKUs`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expiry Timeline Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Upcoming Expiry Horizons</h2>
              <p className="text-xs text-slate-500">Products categorized by days remaining until expiration</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Shelf-Life Cohorts
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiryTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} SKUs`, 'Products']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {expiryTimelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Switcher & Decision Insights Engine */}
      <QuickScenarioSwitcher />

      {/* Critical Attention & High-Risk Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High Risk Items Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Priority Inventory Alerts</h2>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Full Queue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {highRiskProducts.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{product.name}</span>
                    <RiskBadge level={product.riskLevel} />
                    {product.stockoutRisk && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Stockout Imminent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>SKU: {product.sku}</span>
                    <span>•</span>
                    <span>Stock: <strong className="text-slate-700">{product.onHandQty} units</strong></span>
                    <span>•</span>
                    <span>Expires: <strong className={product.daysToExpiry <= 1 ? 'text-rose-600 font-bold' : 'text-slate-700'}>{product.nextExpiryDate} ({product.daysToExpiry}d)</strong></span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    Action: {product.recommendedAction}
                  </p>
                </div>
                <Link
                  href={`/inventory/${product.id}`}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors text-center"
                >
                  Inspect Risk
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Coordinated Recommendations Preview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Coordinator Proposals</h2>
              </div>
              <Link
                href="/recommendations"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Review All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/30 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                      {rec.productName}
                    </span>
                    <StatusBadge status={rec.status} />
                  </div>
                  <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                    {rec.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Benefit: +${rec.tradeoffs.netEstimatedBenefit.toFixed(2)}</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      {(rec.confidence * 100).toFixed(0)}% conf
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/40 rounded-b-xl">
            <Link
              href="/recommendations"
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Open Recommendation Review Modal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
