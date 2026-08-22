import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accentColor?: 'teal' | 'orange' | 'blue' | 'brown';
  trend?: string;
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  accentColor = 'teal', 
  trend,
  className 
}: StatCardProps) {
  
  const borderColors = {
    teal: 'border-l-[var(--color-stat-teal)]',
    orange: 'border-l-[var(--color-stat-orange)]',
    blue: 'border-l-[var(--color-stat-blue)]',
    brown: 'border-l-[var(--color-stat-brown)]',
  };
  
  const textColors = {
    teal: 'text-[var(--color-stat-teal)]',
    orange: 'text-[var(--color-stat-orange)]',
    blue: 'text-[var(--color-stat-blue)]',
    brown: 'text-[var(--color-stat-brown)]',
  };

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-card p-5 border-l-4 flex flex-col justify-between h-full min-h-[120px]",
      borderColors[accentColor],
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest max-w-[70%]">
          {label}
        </h3>
        {icon && (
          <div className={cn("opacity-80", textColors[accentColor])}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-3xl font-serif font-bold text-gray-900">
          {value}
        </div>
        {trend && (
          <div className="text-xs font-medium bg-gray-50 px-2 py-1 rounded text-gray-600">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
