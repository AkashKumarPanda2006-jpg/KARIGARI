import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accentColor?: 'teal' | 'orange' | 'blue' | 'brown';
  trend?: string;
  className?: string;
  variant?: 'default' | 'admin';
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  accentColor = 'teal', 
  trend,
  className,
  variant = 'default'
}: StatCardProps) {
  
  if (variant === 'admin') {
    return (
      <div className={cn(
        "bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between h-full min-h-[140px] border border-gray-100",
        className
      )}>
        <div className="flex items-center gap-2 mb-4">
          {icon && (
            <div className="text-gray-500">
              {icon}
            </div>
          )}
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            {label}
          </h3>
        </div>
        
        <div className="flex items-end justify-between mt-auto">
          <div className="text-5xl font-serif font-bold text-gray-900 tracking-tight">
            {value}
          </div>
          {trend && (
            <div className="text-sm font-medium text-gray-500">
              {trend}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant (Artisan Dashboard)
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
