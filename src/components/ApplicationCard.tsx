
import { Job } from '@/types/types';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import { Card } from '@/components/ui/card';
import { Building, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface ApplicationCardProps {
  job: Job;
  className?: string;
}

const ApplicationCard = ({ job, className }: ApplicationCardProps) => {
  // Format the date
  const formattedDate = (() => {
    try {
      return format(new Date(job.applicationDate), 'MMM d, yyyy');
    } catch (error) {
      return job.applicationDate;
    }
  })();

  // Format last updated
  const lastUpdatedText = (() => {
    try {
      const date = new Date(job.lastUpdated);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (error) {
      return 'Unknown';
    }
  })();

  return (
    <Link to={`/application/${job.id}`}>
      <Card 
        className={cn(
          'overflow-hidden transition-all duration-300 p-5 hover:shadow-md hover:translate-y-[-2px] bg-card border-border',
          className
        )}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Building className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">{job.companyName}</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">{job.position}</h3>
            
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs mt-2">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          
          <StatusBadge status={job.status} />
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdatedText}
            </span>
            
            <div className="text-primary flex items-center text-xs font-medium">
              View Details
              <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ApplicationCard;
