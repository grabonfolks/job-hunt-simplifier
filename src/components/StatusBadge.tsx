
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { ApplicationStatus } from '@/types/types';
import { CheckCircle, Clock, FileEdit, Phone, Send, X, Award, Ban } from "lucide-react";

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
  },
  interviewing: {
    color: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/30',
    label: 'Interviewing',
    icon: <Phone className="h-3.5 w-3.5 mr-1" />
  },
  offered: {
    color: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30',
    label: 'Offered',
    icon: <Award className="h-3.5 w-3.5 mr-1" />
  },
  rejected: {
    color: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/30',
    label: 'Rejected',
    icon: <X className="h-3.5 w-3.5 mr-1" />
  },
  accepted: {
    color: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/30',
    label: 'Accepted',
    icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
  },
  withdrawn: {
    color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700/30',
    label: 'Withdrawn',
    icon: <Ban className="h-3.5 w-3.5 mr-1" />
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
