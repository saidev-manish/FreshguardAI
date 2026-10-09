'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  FileQuestion
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { RiskLevel } from '../../types/inventory';

export default function InventoryRiskPage() {
  const { products } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expiryFilter, setExpiryFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'daysToExpiry' | 'onHandQty' | 'name' | 'riskLevel'>('daysToExpiry');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const categories = ['ALL', 'Dairy', 'Produce', 'Bakery', 'Meat', 'Prepared Foods'];
  const riskLevels = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRisk('ALL');
    setSelectedCategory('ALL');
    setExpiryFilter('ALL');
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase());

        // Risk filter
        const matchesRisk = selectedRisk === 'ALL' || p.riskLevel === selectedRisk;

        // Category filter
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

        // Expiry filter
        let matchesExpiry = true;
        if (expiryFilter === 'TODAY') matchesExpiry = p.daysToExpiry === 0;
        if (expiryFilter === '2DAYS') matchesExpiry = p.daysToExpiry <= 2;
        if (expiryFilter === '3PLUS') matchesExpiry = p.daysToExpiry > 2;

        return matchesSearch && matchesRisk && matchesCategory && matchesExpiry;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'riskLevel') {
          const priority: Record<RiskLevel, number> = {
            CRITICAL: 4,
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1
          };
          valA = priority[a.riskLevel];
          valB = priority[b.riskLevel];
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [products, searchQuery, selectedRisk, selectedCategory, expiryFilter, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Risk Queue"
        description="Filterable catalog of perishable inventory cohorts, expiration horizons, velocity forecasts, and recommended manager actions."
        badge={`${filteredProducts.length} Products`}
        actions={
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              aria-label="Filter by Risk Tier"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {riskLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Risk Tier: {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Window Filter */}
          <div>
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              aria-label="Filter by Expiry Horizon"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Expiry Horizon: All</option>
              <option value="TODAY">Expiring Today (0 Days)</option>
              <option value="2DAYS">Critical: ≤ 2 Days</option>
              <option value="3PLUS">Buffer: &gt; 2 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No Matching Inventory Found"
          description="Try clearing your search query or broadening your risk and category filters."
          actionText="Reset All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      Product & SKU
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">Category</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('onHandQty')}
                  >
                    <div className="flex items-center gap-1.5">
                      On-Hand Stock
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">Forecast (7d)</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('daysToExpiry')}
                  >
                    <div className="flex items-center gap-1.5">
                      Expiry Date
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('riskLevel')}
                  >
                    <div className="flex items-center gap-1.5">
                      Risk Tier
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">Recommended Action</th>
                  <th className="p-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-3.5">
                      <div>
                        <Link
                          href={`/inventory/${p.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                        >
                          {p.name}
                        </Link>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {p.sku} • {p.id}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">{p.category}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800">{p.onHandQty}</span>{' '}
                      <span className="text-slate-400 text-[11px]">units</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-700">{p.estimatedDemand7d}</span>{' '}
                      <span className="text-slate-400 text-[11px]">units</span>
                    </td>
                    <td className="p-3.5">
                      <div className={p.daysToExpiry <= 1 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {p.nextExpiryDate}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.daysToExpiry === 0 ? 'Expiring Today' : `${p.daysToExpiry} days left`}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <RiskBadge level={p.riskLevel} />
                      {p.dataQualityWarning && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Data Warning</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-slate-600" title={p.recommendedAction}>
                      {p.recommendedAction}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/inventory/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold transition-colors"
                      >
                        Detail
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
