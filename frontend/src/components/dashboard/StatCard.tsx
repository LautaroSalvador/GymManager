import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-50',
  description,
}) => (
  <div className="card p-5 flex items-start gap-4">
    <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${iconBg}`}>
      <Icon size={20} className={iconColor} strokeWidth={2} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-neutral-500 leading-none mb-1.5">{label}</p>
      <p className="text-2xl font-bold text-neutral-900 leading-none">{value}</p>
      {description && (
        <p className="text-xs text-neutral-400 mt-1">{description}</p>
      )}
    </div>
  </div>
);
