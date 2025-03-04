
import { Job, MongoDBConfig, Filter } from "@/types/types";

// Function to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Functions for filter management
export const getFilter = (): Filter => {
  const filterString = localStorage.getItem('filter');
  return filterString ? JSON.parse(filterString) : {
    search: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  };
};

export const saveFilter = (filter: Filter): void => {
  localStorage.setItem('filter', JSON.stringify(filter));
};

export const applyFilters = (jobs: Job[], filter: Filter): Job[] => {
  let filteredJobs = [...jobs];
  
  // Apply search filter
  if (filter.search) {
    const searchTerm = filter.search.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      (job.companyName?.toLowerCase().includes(searchTerm) || 
       job.position?.toLowerCase().includes(searchTerm) ||
       job.location?.toLowerCase().includes(searchTerm))
    );
  }
  
  // Apply status filter
  if (filter.status !== 'all') {
    filteredJobs = filteredJobs.filter(job => job.status === filter.status);
  }
  
  // Apply sorting
  filteredJobs.sort((a, b) => {
    if (filter.sortBy === 'date') {
      const dateA = a.applicationDate || a.lastUpdated;
      const dateB = b.applicationDate || b.lastUpdated;
      return filter.sortOrder === 'asc' 
        ? new Date(dateA).getTime() - new Date(dateB).getTime()
        : new Date(dateB).getTime() - new Date(dateA).getTime();
    }
    
    if (filter.sortBy === 'company') {
      const companyA = a.companyName || '';
      const companyB = b.companyName || '';
      return filter.sortOrder === 'asc'
        ? companyA.localeCompare(companyB)
        : companyB.localeCompare(companyA);
    }
    
    if (filter.sortBy === 'status') {
      return filter.sortOrder === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    
    return 0;
  });
  
  return filteredJobs;
};

// Function to get MongoDB configuration from environment variables
export const getMongoDBConfig = (): MongoDBConfig => {
  const enabled = import.meta.env.VITE_MONGODB_URI === 'true';
  const apiUrl = import.meta.env.VITE_API_URL;
  
  return {
    enabled: enabled,
    apiUrl: apiUrl,
  };
};

// Function to get jobs from local storage
const getJobsFromLocalStorage = (): Job[] => {
  const jobsString = localStorage.getItem('jobs');
  return jobsString ? JSON.parse(jobsString) : [];
};

// Function to get a job from local storage by ID
const getJobFromLocalStorage = (id: string): Job | null => {
  const jobs = getJobsFromLocalStorage();
  const job = jobs.find((job) => job.id === id);
  return job || null;
};

// Function to add a job to local storage
const addJobToLocalStorage = (job: Job): void => {
  const jobs = getJobsFromLocalStorage();
  jobs.push(job);
  localStorage.setItem('jobs', JSON.stringify(jobs));
};

// Function to update a job in local storage
const updateJobInLocalStorage = (id: string, job: Job): void => {
  const jobs = getJobsFromLocalStorage();
  const updatedJobs = jobs.map((j) => (j.id === id ? job : j));
  localStorage.setItem('jobs', JSON.stringify(updatedJobs));
};

// Function to delete a job from local storage
const deleteJobFromLocalStorage = (id: string): void => {
  const jobs = getJobsFromLocalStorage();
  const updatedJobs = jobs.filter((job) => job.id !== id);
  localStorage.setItem('jobs', JSON.stringify(updatedJobs));
};

// Add function to update MongoDB status for fallback handling
export const setMongoDBStatus = (status: boolean): void => {
  localStorage.setItem('mongodb_connected', status ? 'true' : 'false');
};

// Files storage utility
export const storeFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        resolve(e.target.result);
      } else {
        resolve('');
      }
    };
    
    reader.readAsDataURL(file);
  });
};

// Get job by ID (combining local and MongoDB)
export const getJobById = async (id: string): Promise<Job | null> => {
  return getJob(id);
};

// Update getJobs to better handle MongoDB connection issues
export const getJobs = async (): Promise<Job[]> => {
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${mongoConfig.apiUrl}/applications`, {
        signal: controller.signal
      }).catch(error => {
        if (error.name === 'AbortError') {
          throw new Error('Connection timeout');
        }
        throw error;
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const jobs = await response.json();
        return jobs;
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting jobs from MongoDB:', error);
      // Fallback to localStorage
      setMongoDBStatus(false);
      return getJobsFromLocalStorage();
    }
  } else {
    return getJobsFromLocalStorage();
  }
};

// Update getJob to better handle MongoDB connection issues
export const getJob = async (id: string): Promise<Job | null> => {
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${mongoConfig.apiUrl}/applications/${id}`, {
        signal: controller.signal
      }).catch(error => {
        if (error.name === 'AbortError') {
          throw new Error('Connection timeout');
        }
        throw error;
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const job = await response.json();
        return job;
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting job from MongoDB:', error);
      // Fallback to localStorage
      setMongoDBStatus(false);
      return getJobFromLocalStorage(id);
    }
  } else {
    return getJobFromLocalStorage(id);
  }
};

// Update addJob to better handle MongoDB connection issues and add ID/lastUpdated
export const addJob = async (jobData: Omit<Job, "id" | "lastUpdated">): Promise<void> => {
  // Create a complete job with id and lastUpdated fields
  const job: Job = {
    ...jobData,
    id: generateId(),
    lastUpdated: new Date().toISOString()
  };

  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${mongoConfig.apiUrl}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(job),
        signal: controller.signal
      }).catch(error => {
        if (error.name === 'AbortError') {
          throw new Error('Connection timeout');
        }
        throw error;
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding job to MongoDB:', error);
      // Fallback to localStorage
      setMongoDBStatus(false);
      addJobToLocalStorage(job);
    }
  } else {
    addJobToLocalStorage(job);
  }
};

// Update updateJob to better handle MongoDB connection issues
export const updateJob = async (job: Job): Promise<void> => {
  const mongoConfig = getMongoDBConfig();
  
  // Update the lastUpdated timestamp
  const updatedJob = {
    ...job,
    lastUpdated: new Date().toISOString()
  };
  
  if (mongoConfig.enabled) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${mongoConfig.apiUrl}/applications/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedJob),
        signal: controller.signal
      }).catch(error => {
        if (error.name === 'AbortError') {
          throw new Error('Connection timeout');
        }
        throw error;
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating job in MongoDB:', error);
      // Fallback to localStorage
      setMongoDBStatus(false);
      updateJobInLocalStorage(job.id, updatedJob);
    }
  } else {
    updateJobInLocalStorage(job.id, updatedJob);
  }
};

// Update deleteJob to better handle MongoDB connection issues
export const deleteJob = async (id: string): Promise<void> => {
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${mongoConfig.apiUrl}/applications/${id}`, {
        method: 'DELETE',
        signal: controller.signal
      }).catch(error => {
        if (error.name === 'AbortError') {
          throw new Error('Connection timeout');
        }
        throw error;
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting job from MongoDB:', error);
      // Fallback to localStorage
      setMongoDBStatus(false);
      deleteJobFromLocalStorage(id);
    }
  } else {
    deleteJobFromLocalStorage(id);
  }
};

// Function to generate a new job with a unique ID and lastUpdated timestamp
export const generateNewJob = (): Job => {
  const newId = generateId();
  const now = new Date().toISOString();
  
  return {
    id: newId,
    status: 'applied',
    lastUpdated: now,
  };
};
