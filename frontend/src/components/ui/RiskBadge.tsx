import React from 'react';
import { RiskLevel } from '../../types/inventory';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = '' }) => {
  switch (level) {
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Critical Risk
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          High Risk
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200 ${className}`}
        >
          <Info className="w-3.5 h-3.5 text-yellow-600" />
          Medium Risk
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Low Risk
        </span>
      );
  }
};
