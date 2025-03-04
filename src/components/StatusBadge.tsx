
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { ApplicationStatus } from '@/types/types';
import { FileEdit, Send } from "lucide-react";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const statusConfig: Record<ApplicationStatus, { color: string; label: string; icon: React.ReactNode }> = {
  saved: {
    color: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30',
    label: 'Saved',
    icon: <FileEdit className="h-3.5 w-3.5 mr-1" />
  },
  applied: {
    color: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/30',
    label: 'Applied',
    icon: <Send className="h-3.5 w-3.5 mr-1" />
  }
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        'flex items-center py-1 px-2 rounded-full font-medium text-xs transition-all',
        config.color,
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
