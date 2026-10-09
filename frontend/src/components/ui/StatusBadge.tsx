import React from 'react';
import { RecommendationStatus } from '../../types/recommendation';
import { Clock, CheckCheck, Edit3, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: RecommendationStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );
    case 'EDITED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 ${className}`}
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
          Edited & Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-slate-500" />
          Rejected
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Pending Review
        </span>
      );
  }
};
