
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <Card className={cn('p-5 bg-card border-border', className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          
          {trend && (
            <div className={cn(
              'flex items-center text-xs mt-2',
              trend.isPositive ? 'text-emerald-500' : 'text-red-500'
            )}>
              <span className="text-xs">
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                vs last week
              </span>
            </div>
          )}
        </div>
        
        <div className="p-2 rounded-full bg-primary/10">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
