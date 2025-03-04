
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ApplicationCard from '@/components/ApplicationCard';
import SearchBar from '@/components/SearchBar';
import { Filter, Job } from '@/types/types';
import { getJobs, getFilter, saveFilter, applyFilters, getMongoDBConfig } from '@/lib/storage';
import { PlusCircle, Database, HardDrive, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface IndexProps {
  storageMode?: string;
}

const Index: React.FC<IndexProps> = ({ storageMode = 'Loading...' }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<Filter>(getFilter());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mongoConfig = getMongoDBConfig();
  
  // Load jobs from storage on component mount
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const loadedJobs = await getJobs();
        setJobs(loadedJobs);
        
        // Apply filters to the loaded jobs
        const filtered = applyFilters(loadedJobs, filter);
        setFilteredJobs(filtered);
        setError(null);
      } catch (error) {
        console.error('Error loading jobs:', error);
        setError('Failed to load job applications');
        toast.error('Failed to load job applications');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJobs();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (newFilter: Filter) => {
    setFilter(newFilter);
    saveFilter(newFilter);
    
    const filtered = applyFilters(jobs, newFilter);
    setFilteredJobs(filtered);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight">Apply Archive</h1>
              <p className="text-muted-foreground mt-1">Track and manage your job applications</p>
              
              <div className="mt-2 flex items-center">
                {mongoConfig.enabled ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Database className="h-4 w-4 mr-1 text-primary" />
                    Using MongoDB storage
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <HardDrive className="h-4 w-4 mr-1" />
                    Using local storage
                  </div>
                )}
              </div>
            </div>
            
            <Link to="/add-application">
              <Button className="mt-4 sm:mt-0 flex items-center gap-2 transition-all duration-300 animate-slide-in-right">
                <PlusCircle className="h-4 w-4" />
                Add Application
              </Button>
            </Link>
          </div>
          
          <SearchBar 
            filter={filter} 
            onFilterChange={handleFilterChange}
            className="animate-slide-up animation-delay-500"
          />
        </header>
        
        <main>
          {isLoading ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Loading applications...</p>
              </div>
            </Card>
          ) : error ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-destructive/10 p-4">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold">Error loading applications</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </Card>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job, index) => (
                <ApplicationCard 
                  key={job.id} 
                  job={job} 
                  className={`animate-fade-in animation-delay-${(index % 5) * 100}`}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center animate-fade-in">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No applications found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {jobs.length > 0 
                    ? "No applications match your current filters. Try adjusting your search criteria."
                    : "You haven't added any job applications yet. Get started by adding your first application."}
                </p>
                
                {jobs.length === 0 && (
                  <Link to="/add-application">
                    <Button className="mt-4">
                      Add Your First Application
                    </Button>
                  </Link>
                )}
                
                {jobs.length > 0 && filter.search && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleFilterChange({ ...filter, search: '' })}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
