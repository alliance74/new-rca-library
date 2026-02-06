'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  variant?: 'dark' | 'light';
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  change,
  variant = 'dark',
}: StatCardProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-[8px] p-8 flex items-center gap-6 min-h-40 ${
        isDark
          ? 'text-white'
          : 'bg-white text-gray-900 border border-gray-200'
      }`}
      style={isDark ? { backgroundColor: '#001240', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)' } : { boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)' }}
    >
      <Icon className="h-12 w-12 shrink-0" />
      <div className="flex-1">
        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {label}
        </p>
        <div className="mt-1">
          <span className="text-3xl font-bold block">{value}</span>
          {change && (
            <span className={`text-xs font-medium block mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
