import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, HelpCircle, AlertOctagon } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true
}) => {
  const getBadgeConfig = () => {
    switch (level) {
      case 'Critical':
        return {
          bg: 'bg-red-50 border-red-200 text-red-700 shadow-sm',
          dot: 'bg-red-600',
          icon: AlertOctagon,
          label: 'Critical Risk'
        };
      case 'High':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm',
          dot: 'bg-orange-600',
          icon: ShieldAlert,
          label: 'High Risk'
        };
      case 'Medium':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800 shadow-sm',
          dot: 'bg-amber-600',
          icon: AlertTriangle,
          label: 'Medium Risk'
        };
      case 'Low':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm',
          dot: 'bg-emerald-600',
          icon: ShieldCheck,
          label: 'Clean / Low'
        };
      default:
        return {
          bg: 'bg-[#f7f5f0] border-[#dedad2] text-[#52504c] shadow-sm',
          dot: 'bg-[#52504c]',
          icon: HelpCircle,
          label: 'Unknown'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-sm ${config.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  );
};
