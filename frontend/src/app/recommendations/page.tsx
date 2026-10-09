'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Edit3,
  ExternalLink,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Truck,
  PackageCheck,
  Tag,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Recommendation, RecommendationStatus } from '../../types/recommendation';

export default function RecommendationsPage() {
  const {
    recommendations,
    approveRecommendation,
    editAndApproveRecommendation,
    rejectRecommendation,
    isSubmittingReview
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Edit modal state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editDiscountPct, setEditDiscountPct] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  // Reject modal state
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Keyboard accessibility: dismiss modals with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false);
          setSelectedRec(null);
        }
        if (isRejecting) {
          setIsRejecting(false);
          setSelectedRec(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, isRejecting]);

  const filteredRecs = recommendations.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const openEditModal = (rec: Recommendation) => {
    setSelectedRec(rec);
    setEditQuantity(rec.suggestedQuantity);
    setEditDiscountPct(rec.suggestedDiscountPct || 20);
    setEditNotes('');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRec || isSubmittingReview) return;
    setProcessingId(selectedRec.id);
    try {
      await editAndApproveRecommendation(selectedRec.id, {
        quantity: editQuantity,
        discountPct: editDiscountPct,
        notes: editNotes
      });
      setIsEditing(false);
      setSelectedRec(null);
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (rec: Recommendation) => {
    setSelectedRec(rec);
    setRejectReason('');
    setIsRejecting(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRec || isSubmittingReview) return;
    setProcessingId(selectedRec.id);
    try {
      await rejectRecommendation(selectedRec.id, rejectReason);
      setIsRejecting(false);
      setSelectedRec(null);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDirectApprove = async (recId: string) => {
    if (isSubmittingReview) return;
    setProcessingId(recId);
    try {
      await approveRecommendation(recId);
    } finally {
      setProcessingId(null);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'MARKDOWN':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'TRANSFER':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'REPLENISHMENT':
        return <PackageCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recommendation Review & Action Queue"
        description="Human-in-the-loop decision engine. Review, customize, or reject candidate operational interventions synthesized by the Multi-Agent Coordinator."
        badge={`${recommendations.filter((r) => r.status === 'PENDING').length} Pending Approval`}
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'PENDING', 'APPROVED', 'EDITED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === status
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status === 'ALL' ? 'All Recommendations' : status}
            <span className="ml-1.5 opacity-70">
              ({status === 'ALL' ? recommendations.length : recommendations.filter((r) => r.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Cards List */}
      {filteredRecs.length === 0 ? (
        <EmptyState
          title="No Recommendations In This Queue"
          description={`There are currently no recommendations with status "${statusFilter}".`}
          actionText="Show All Recommendations"
          onAction={() => setStatusFilter('ALL')}
        />
      ) : (
        <div className="space-y-4">
          {filteredRecs.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    {getActionIcon(rec.actionType)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                      <RiskBadge level={rec.riskLevel} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>ID: <strong className="font-mono text-slate-700">{rec.id}</strong></span>
                      <span>•</span>
                      <span>Product: <Link href={`/inventory/${rec.productId}`} className="text-emerald-700 hover:underline font-medium">{rec.productName}</Link></span>
                      <span>•</span>
                      <span>SKU: {rec.sku}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">
                    Confidence: <strong className="text-emerald-700">{(rec.confidence * 100).toFixed(0)}%</strong>
                  </span>
                  <StatusBadge status={rec.status} />
                </div>
              </div>

              {/* Rationale & Action Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                <div className="lg:col-span-2 space-y-2">
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {rec.details}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    <strong>Coordinator Rationale:</strong> {rec.rationale}
                  </p>
                  
                  {/* Evidence list */}
                  <div className="mt-2 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Supporting Evidence:</span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                      {rec.evidence.map((ev, idx) => (
                        <li key={idx}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tradeoffs Box */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Estimated Trade-Offs ($)
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Avoided Waste:</span>
                      <span className="font-semibold text-emerald-700">+${rec.tradeoffs.avoidedWasteCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Margin Concession:</span>
                      <span className="font-semibold text-rose-700">${rec.tradeoffs.marginImpact.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
                      <span>Net Impact:</span>
                      <span className={rec.tradeoffs.netEstimatedBenefit >= 0 ? 'text-emerald-700' : 'text-slate-700'}>
                        +${rec.tradeoffs.netEstimatedBenefit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic pt-1">
                    *Simulated estimate derived from baseline demand elasticity model.
                  </p>
                </div>
              </div>

              {/* Decision trail if already reviewed */}
              {rec.reviewedBy && (
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold">Reviewed by {rec.reviewedBy}</span> on {rec.reviewedAt}
                    {rec.reviewerNotes && <p className="italic text-slate-600 mt-0.5">"{rec.reviewerNotes}"</p>}
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                    Audit Log Entry Created
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <Link
                  href={`/inventory/${rec.productId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Inspect Inventory Telemetry
                </Link>

                {rec.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openRejectModal(rec)}
                      disabled={isSubmittingReview}
                      aria-label={`Reject recommendation for ${rec.productName}`}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-rose-500 focus:outline-hidden disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => openEditModal(rec)}
                      disabled={isSubmittingReview}
                      aria-label={`Customize parameters for ${rec.productName}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-slate-400 focus:outline-hidden disabled:opacity-50 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => handleDirectApprove(rec.id)}
                      disabled={isSubmittingReview}
                      aria-label={`Approve recommendation for ${rec.productName}`}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:opacity-50 cursor-pointer"
                    >
                      {processingId === rec.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve Action</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(rec)}
                      disabled={isSubmittingReview}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium focus:ring-2 focus:ring-slate-400 focus:outline-hidden disabled:opacity-50 cursor-pointer"
                    >
                      Re-evaluate
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Recommendation Modal */}
      {isEditing && selectedRec && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <h3 id="edit-modal-title" className="text-base font-bold text-slate-900">
                  Customize Action Parameters
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Modifying proposal for <strong className="text-slate-900">{selectedRec.productName}</strong> ({selectedRec.id}).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="edit-quantity-input" className="font-semibold text-slate-700 block mb-1">
                  Adjust Quantity (Units)
                </label>
                <input
                  id="edit-quantity-input"
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Number(e.target.value))}
                  disabled={isSubmittingReview}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {selectedRec.actionType === 'MARKDOWN' && (
                <div>
                  <label htmlFor="edit-discount-input" className="font-semibold text-slate-700 block mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    id="edit-discount-input"
                    type="number"
                    value={editDiscountPct}
                    onChange={(e) => setEditDiscountPct(Number(e.target.value))}
                    disabled={isSubmittingReview}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label htmlFor="edit-notes-input" className="font-semibold text-slate-700 block mb-1">
                  Manager Reviewer Note (Stored in Audit Trail)
                </label>
                <textarea
                  id="edit-notes-input"
                  rows={3}
                  placeholder="Specify reason for manual adjustment..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  disabled={isSubmittingReview}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSubmittingReview}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSubmittingReview}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:bg-emerald-800 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:opacity-60 flex items-center gap-1.5"
              >
                {isSubmittingReview ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save & Approve Custom Action</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {isRejecting && selectedRec && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 id="reject-modal-title" className="text-base font-bold">
                Reject Proposed Action
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to reject the proposal for <strong className="text-slate-900">{selectedRec.productName}</strong>? Please record the operational justification:
            </p>

            <div>
              <label htmlFor="reject-reason-input" className="sr-only">
                Operational rejection reason
              </label>
              <textarea
                id="reject-reason-input"
                rows={3}
                placeholder="e.g., Cold storage maintenance, scheduled supplier return, or local promo conflict..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={isSubmittingReview}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRejecting(false)}
                disabled={isSubmittingReview}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isSubmittingReview}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 active:bg-rose-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden disabled:opacity-60 flex items-center gap-1.5"
              >
                {isSubmittingReview ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Confirm Rejection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
