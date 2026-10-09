import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'danger' | 'warning' | 'success' | 'neutral';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'neutral',
  onClick
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-emerald-300 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || badge) && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {badge && (
            <span className={`px-2 py-0.5 rounded-md font-medium border ${getBadgeStyle()}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
