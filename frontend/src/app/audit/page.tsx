'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Edit3,
  XCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';

export default function AuditHistoryPage() {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.recommendationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.reviewer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.notes.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || log.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [auditLogs, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decision Audit Log & Operational History"
        description="Immutable compliance trail tracking all human-in-the-loop decisions, parameter customizations, and coordinator recommendations."
        badge={`${auditLogs.length} Total Events Recorded`}
      />

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU, manager, action or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Decision Status"
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Decisions</option>
            <option value="APPROVED">Approved Actions</option>
            <option value="EDITED">Edited & Approved</option>
            <option value="REJECTED">Rejected Actions</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800"
              title="Reset Search & Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No Audit Records Found"
          description="No decision events matched your current search criteria."
          actionText="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Recommendation & Product</th>
                  <th className="p-3.5">Proposed Action</th>
                  <th className="p-3.5">Reviewer Decision</th>
                  <th className="p-3.5">Reviewer & Notes</th>
                  <th className="p-3.5 text-right">Telemetry Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{log.productName}</div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {log.recommendationId} • {log.productId}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs text-slate-700 font-medium">
                      {log.proposedAction}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="p-3.5 max-w-sm">
                      <span className="font-semibold text-slate-800 block">{log.reviewer}</span>
                      <p className="text-slate-600 text-[11px] italic mt-0.5 leading-snug">
                        "{log.notes}"
                      </p>
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {log.source}
                      </span>
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
