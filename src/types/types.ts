
export type ApplicationStatus = 
  | 'saved'
  | 'applied';

export interface Job {
  id: string;
  companyName?: string;
  position?: string;
  location?: string;
  jobDescription?: string;
  applicationDate?: string;
  status: ApplicationStatus;
  notes?: string;
  salary?: string;
  url?: string;
  contactName?: string;
  contactEmail?: string;
  resumePath?: string; // Path or data URL for stored resume
  coverLetterPath?: string; // Path or data URL for stored cover letter
  lastUpdated: string;
}

export interface Filter {
  search: string;
  status: ApplicationStatus | 'all';
  sortBy: 'date' | 'company' | 'status';
  sortOrder: 'asc' | 'desc';
}

// MongoDB configuration interface
export interface MongoDBConfig {
  enabled: boolean;
  apiUrl?: string;
}

// Add a package.json type
export interface PackageJson {
  "type": "module";
}
