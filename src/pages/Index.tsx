
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ApplicationCard from '@/components/ApplicationCard';
import SearchBar from '@/components/SearchBar';
import StatCard from '@/components/StatCard';
import { Filter, Job } from '@/types/types';
import { getJobs, getFilter, saveFilter, applyFilters, getStats } from '@/lib/storage';
import { PlusCircle, Briefcase, Building, Calendar, Phone, Search } from 'lucide-react';

const Index = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<Filter>(getFilter());
  const [stats, setStats] = useState(() => getStats());
  
  // Load jobs from localStorage on component mount
  useEffect(() => {
    const loadedJobs = getJobs();
    setJobs(loadedJobs);
    
    // Apply filters to the loaded jobs
    const filtered = applyFilters(loadedJobs, filter);
    setFilteredJobs(filtered);
    
    // Get statistics
    setStats(getStats());
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
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Apply Archive</h1>
              <p className="text-muted-foreground mt-1">Track and manage your job applications</p>
            </div>
            
            <Link to="/add-application">
              <Button className="mt-4 sm:mt-0 flex items-center gap-2 transition-all duration-300 animate-slide-in-right">
                <PlusCircle className="h-4 w-4" />
                Add Application
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Total Applications"
              value={stats.total}
              icon={<Briefcase className="h-5 w-5 text-primary" />}
              className="animate-slide-up animation-delay-100"
            />
            <StatCard 
              title="Applied"
              value={stats.applied}
              icon={<Building className="h-5 w-5 text-primary" />}
              className="animate-slide-up animation-delay-200"
            />
            <StatCard 
              title="Interviewing"
              value={stats.interviewing}
              icon={<Phone className="h-5 w-5 text-primary" />}
              className="animate-slide-up animation-delay-300"
            />
            <StatCard 
              title="Success Rate"
              value={`${stats.total ? Math.round((stats.offered / stats.total) * 100) : 0}%`}
              icon={<Calendar className="h-5 w-5 text-primary" />}
              className="animate-slide-up animation-delay-400"
            />
          </div>
          
          <SearchBar 
            filter={filter} 
            onFilterChange={handleFilterChange}
            className="animate-slide-up animation-delay-500"
          />
        </header>
        
        <main>
          {filteredJobs.length > 0 ? (
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
