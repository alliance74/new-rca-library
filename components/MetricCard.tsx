'use client';

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  iconBgColor?: string;
}

export default function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  iconBgColor = 'bg-blue-100',
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm w-full min-w-0">
      <div className={`${iconBgColor} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900" />
      </div>
      
      <h3 className="text-gray-600 text-xs font-medium mb-1 truncate">{title}</h3>
      
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 truncate">{value}</p>
      
      {subtitle && (
        <p className="text-xs text-gray-500 truncate">
          <span className="text-green-600 font-semibold">↗</span> {subtitle}
        </p>
      )}
    </div>
  );
}
