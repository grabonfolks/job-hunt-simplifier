
import { Job, Interview, ApplicationStatus, Filter } from '@/types/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

// Default filter state
const defaultFilter: Filter = {
  search: '',
  status: 'all',
  sortBy: 'date',
  sortOrder: 'desc'
};

// Helper function to get all jobs from localStorage
export const getJobs = (): Job[] => {
  try {
    const jobs = localStorage.getItem('jobs');
    return jobs ? JSON.parse(jobs) : [];
  } catch (error) {
    console.error('Error getting jobs from localStorage:', error);
    return [];
  }
};

// Helper function to save all jobs to localStorage
export const saveJobs = (jobs: Job[]): void => {
  try {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  } catch (error) {
    console.error('Error saving jobs to localStorage:', error);
    toast.error('Failed to save job data.');
  }
};

// Get a single job by ID
export const getJobById = (id: string): Job | undefined => {
  const jobs = getJobs();
  return jobs.find(job => job.id === id);
};

// Add a new job
export const addJob = (job: Omit<Job, 'id' | 'lastUpdated'>): Job => {
  const jobs = getJobs();
  const newJob: Job = {
    ...job,
    id: uuidv4(),
    lastUpdated: new Date().toISOString()
  };
  saveJobs([...jobs, newJob]);
  toast.success('Job application added successfully.');
  return newJob;
};

// Update an existing job
export const updateJob = (updatedJob: Job): Job => {
  const jobs = getJobs();
  const updatedJobs = jobs.map(job => 
    job.id === updatedJob.id 
      ? { ...updatedJob, lastUpdated: new Date().toISOString() } 
      : job
  );
  saveJobs(updatedJobs);
  toast.success('Job application updated successfully.');
  return { ...updatedJob, lastUpdated: new Date().toISOString() };
};

// Delete a job
export const deleteJob = (id: string): void => {
  const jobs = getJobs();
  const updatedJobs = jobs.filter(job => job.id !== id);
  saveJobs(updatedJobs);
  toast.success('Job application deleted successfully.');
};

// Add an interview to a job
export const addInterview = (jobId: string, interview: Omit<Interview, 'id'>): Interview => {
  const jobs = getJobs();
  const newInterview: Interview = {
    ...interview,
    id: uuidv4()
  };
  
  const updatedJobs = jobs.map(job => {
    if (job.id === jobId) {
      const interviews = job.interviews || [];
      return {
        ...job,
        interviews: [...interviews, newInterview],
        lastUpdated: new Date().toISOString()
      };
    }
    return job;
  });
  
  saveJobs(updatedJobs);
  toast.success('Interview added successfully.');
  return newInterview;
};

// Update an interview
export const updateInterview = (jobId: string, updatedInterview: Interview): void => {
  const jobs = getJobs();
  const updatedJobs = jobs.map(job => {
    if (job.id === jobId && job.interviews) {
      const updatedInterviews = job.interviews.map(interview => 
        interview.id === updatedInterview.id ? updatedInterview : interview
      );
      return {
        ...job,
        interviews: updatedInterviews,
        lastUpdated: new Date().toISOString()
      };
    }
    return job;
  });
  
  saveJobs(updatedJobs);
  toast.success('Interview updated successfully.');
};

// Delete an interview
export const deleteInterview = (jobId: string, interviewId: string): void => {
  const jobs = getJobs();
  const updatedJobs = jobs.map(job => {
    if (job.id === jobId && job.interviews) {
      return {
        ...job,
        interviews: job.interviews.filter(interview => interview.id !== interviewId),
        lastUpdated: new Date().toISOString()
      };
    }
    return job;
  });
  
  saveJobs(updatedJobs);
  toast.success('Interview removed successfully.');
};

// Handle file storage (as data URLs)
export const storeFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

// Save filter preferences
export const saveFilter = (filter: Filter): void => {
  localStorage.setItem('jobFilter', JSON.stringify(filter));
};

// Get filter preferences
export const getFilter = (): Filter => {
  try {
    const filter = localStorage.getItem('jobFilter');
    return filter ? JSON.parse(filter) : defaultFilter;
  } catch (error) {
    console.error('Error getting filter from localStorage:', error);
    return defaultFilter;
  }
};

// Apply filters to jobs
export const applyFilters = (jobs: Job[], filter: Filter): Job[] => {
  let filteredJobs = [...jobs];
  
  // Filter by search term
  if (filter.search) {
    const searchTerm = filter.search.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.companyName.toLowerCase().includes(searchTerm) ||
      job.position.toLowerCase().includes(searchTerm) ||
      job.location.toLowerCase().includes(searchTerm) ||
      job.jobDescription.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by status
  if (filter.status !== 'all') {
    filteredJobs = filteredJobs.filter(job => job.status === filter.status);
  }
  
  // Sort
  filteredJobs.sort((a, b) => {
    let comparison = 0;
    
    switch (filter.sortBy) {
      case 'date':
        comparison = new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
        break;
      case 'company':
        comparison = a.companyName.localeCompare(b.companyName);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return filter.sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return filteredJobs;
};

// Get application statistics
export const getStats = (): Record<string, number> => {
  const jobs = getJobs();
  
  const stats: Record<string, number> = {
    total: jobs.length,
    saved: 0,
    applied: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0,
    accepted: 0,
    withdrawn: 0
  };
  
  jobs.forEach(job => {
    const status = job.status as ApplicationStatus;
    if (stats[status] !== undefined) {
      stats[status]++;
    }
  });
  
  return stats;
};
