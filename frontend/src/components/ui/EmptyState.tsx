import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 mb-4">
      <Icon size={28} strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-semibold text-neutral-700 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-neutral-400 max-w-xs">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
