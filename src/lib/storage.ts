
import { Job, ApplicationStatus, Filter, MongoDBConfig } from '@/types/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

// Default filter state
const defaultFilter: Filter = {
  search: '',
  status: 'all',
  sortBy: 'date',
  sortOrder: 'desc'
};

// Check if MongoDB is enabled
export const getMongoDBConfig = (): MongoDBConfig => {
  const enabled = import.meta.env.VITE_MONGODB_URI ? true : false;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  return {
    enabled,
    apiUrl
  };
};

// Helper function to get all jobs from localStorage or MongoDB
export const getJobs = async (): Promise<Job[]> => {
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled && mongoConfig.apiUrl) {
    try {
      const response = await fetch(`${mongoConfig.apiUrl}/applications`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications from MongoDB');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting jobs from MongoDB:', error);
      toast.error('Failed to fetch data from the server. Using local storage instead.');
      return getJobsFromLocalStorage();
    }
  } else {
    return getJobsFromLocalStorage();
  }
};

// Get jobs from localStorage only
const getJobsFromLocalStorage = (): Job[] => {
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
export const getJobById = async (id: string): Promise<Job | undefined> => {
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled && mongoConfig.apiUrl) {
    try {
      const response = await fetch(`${mongoConfig.apiUrl}/applications/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch application from MongoDB');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting job from MongoDB:', error);
      toast.error('Failed to fetch data from the server. Using local storage instead.');
      return getJobByIdFromLocalStorage(id);
    }
  } else {
    return getJobByIdFromLocalStorage(id);
  }
};

// Get job by ID from localStorage
const getJobByIdFromLocalStorage = (id: string): Job | undefined => {
  const jobs = getJobsFromLocalStorage();
  return jobs.find(job => job.id === id);
};

// Add a new job
export const addJob = async (job: Omit<Job, 'id' | 'lastUpdated'>): Promise<Job> => {
  const newJob: Job = {
    ...job,
    id: uuidv4(),
    lastUpdated: new Date().toISOString(),
    status: job.status || 'applied'
  };
  
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled && mongoConfig.apiUrl) {
    try {
      const response = await fetch(`${mongoConfig.apiUrl}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJob),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add application to MongoDB');
      }
      
      const savedJob = await response.json();
      toast.success('Job application added successfully.');
      return savedJob;
    } catch (error) {
      console.error('Error adding job to MongoDB:', error);
      toast.error('Failed to save to server. Saving to local storage instead.');
      
      // Fallback to localStorage
      const jobs = getJobsFromLocalStorage();
      saveJobs([...jobs, newJob]);
      return newJob;
    }
  } else {
    // Use localStorage
    const jobs = getJobsFromLocalStorage();
    saveJobs([...jobs, newJob]);
    toast.success('Job application added successfully.');
    return newJob;
  }
};

// Update an existing job
export const updateJob = async (updatedJob: Job): Promise<Job> => {
  const jobWithUpdatedTimestamp = { 
    ...updatedJob, 
    lastUpdated: new Date().toISOString() 
  };
  
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled && mongoConfig.apiUrl) {
    try {
      const response = await fetch(`${mongoConfig.apiUrl}/applications/${updatedJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobWithUpdatedTimestamp),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application in MongoDB');
      }
      
      const savedJob = await response.json();
      toast.success('Job application updated successfully.');
      return savedJob;
    } catch (error) {
      console.error('Error updating job in MongoDB:', error);
      toast.error('Failed to update on server. Updating in local storage instead.');
      
      // Fallback to localStorage
      const jobs = getJobsFromLocalStorage();
      const updatedJobs = jobs.map(job => 
        job.id === updatedJob.id ? jobWithUpdatedTimestamp : job
      );
      saveJobs(updatedJobs);
      return jobWithUpdatedTimestamp;
    }
  } else {
    // Use localStorage
    const jobs = getJobsFromLocalStorage();
    const updatedJobs = jobs.map(job => 
      job.id === updatedJob.id ? jobWithUpdatedTimestamp : job
    );
    saveJobs(updatedJobs);
    toast.success('Job application updated successfully.');
    return jobWithUpdatedTimestamp;
  }
};

// Delete a job
export const deleteJob = async (id: string): Promise<void> => {
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled && mongoConfig.apiUrl) {
    try {
      const response = await fetch(`${mongoConfig.apiUrl}/applications/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete application from MongoDB');
      }
      
      toast.success('Job application deleted successfully.');
    } catch (error) {
      console.error('Error deleting job from MongoDB:', error);
      toast.error('Failed to delete from server. Deleting from local storage instead.');
      
      // Fallback to localStorage
      const jobs = getJobsFromLocalStorage();
      const updatedJobs = jobs.filter(job => job.id !== id);
      saveJobs(updatedJobs);
    }
  } else {
    // Use localStorage
    const jobs = getJobsFromLocalStorage();
    const updatedJobs = jobs.filter(job => job.id !== id);
    saveJobs(updatedJobs);
    toast.success('Job application deleted successfully.');
  }
};

// Handle file storage (as data URLs)
export const storeFile = async (file: File): Promise<string> => {
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled && mongoConfig.apiUrl) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${mongoConfig.apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file to server');
      }
      
      const result = await response.json();
      return result.filePath;
    } catch (error) {
      console.error('Error uploading file to server:', error);
      toast.error('Failed to upload to server. Storing locally instead.');
      
      // Fallback to localStorage
      return storeFileLocally(file);
    }
  } else {
    // Use localStorage
    return storeFileLocally(file);
  }
};

// Store file locally as data URL
const storeFileLocally = (file: File): Promise<string> => {
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
      (job.companyName?.toLowerCase().includes(searchTerm) || false) ||
      (job.position?.toLowerCase().includes(searchTerm) || false) ||
      (job.location?.toLowerCase().includes(searchTerm) || false) ||
      (job.jobDescription?.toLowerCase().includes(searchTerm) || false)
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
        const aDate = a.applicationDate ? new Date(a.applicationDate).getTime() : 0;
        const bDate = b.applicationDate ? new Date(b.applicationDate).getTime() : 0;
        comparison = aDate - bDate;
        break;
      case 'company':
        const aCompany = a.companyName || '';
        const bCompany = b.companyName || '';
        comparison = aCompany.localeCompare(bCompany);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return filter.sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return filteredJobs;
};

// Get application count
export const getApplicationCount = (): number => {
  const jobs = getJobsFromLocalStorage();
  return jobs.length;
};
