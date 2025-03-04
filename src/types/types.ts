
export type ApplicationStatus = 
  | 'saved'
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | 'accepted'
  | 'withdrawn';

export interface Job {
  id: string;
  companyName: string;
  position: string;
  location: string;
  jobDescription: string;
  applicationDate: string;
  status: ApplicationStatus;
  notes?: string;
  salary?: string;
  url?: string;
  contactName?: string;
  contactEmail?: string;
  resumePath?: string; // Path or data URL for stored resume
  coverLetterPath?: string; // Path or data URL for stored cover letter
  lastUpdated: string;
  interviews?: Interview[];
}

export interface Interview {
  id: string;
  date: string;
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'other';
  interviewerName?: string;
  notes?: string;
  completed: boolean;
}

export interface Filter {
  search: string;
  status: ApplicationStatus | 'all';
  sortBy: 'date' | 'company' | 'status';
  sortOrder: 'asc' | 'desc';
}
