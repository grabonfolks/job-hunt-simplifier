
# Apply Archive - Developer Documentation

This document provides detailed technical information about the Apply Archive application, explaining the workflow, architecture decisions, data storage mechanisms, and implementation details.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Data Flow](#data-flow)
- [Type System](#type-system)
- [Storage Implementation](#storage-implementation)
- [File Handling](#file-handling)
- [Error Handling Strategy](#error-handling-strategy)
- [MongoDB Integration](#mongodb-integration)
- [Cross-Platform Considerations](#cross-platform-considerations)

## Architecture Overview

Apply Archive is built as a React application with an optional Express backend that connects to MongoDB. The application is designed to function in two modes:

1. **Frontend-only mode** using browser localStorage (no backend required)
2. **Full-stack mode** using MongoDB for persistent storage

The application automatically detects the availability of MongoDB and gracefully falls back to localStorage if the database connection fails, ensuring the application remains functional regardless of backend availability.

## Data Flow

### Application Startup Flow
1. App loads and checks environment variables for MongoDB configuration
2. If MongoDB is enabled, the app attempts to connect to the API server
3. If connection succeeds, MongoDB mode is activated
4. If connection fails, localStorage mode is activated with a user notification
5. Initial data is loaded from the selected storage method

### Job Application Lifecycle
1. **Creation**:
   - User fills the application form (company, position, etc.)
   - Optional resume/cover letter uploads are processed
   - New job is saved to storage with a unique ID and timestamp
   - User is redirected to the dashboard

2. **Viewing**:
   - Dashboard displays all applications with filtering options
   - Clicking an application card opens detailed view
   - File attachments can be downloaded or viewed

3. **Editing**:
   - User modifies application details
   - All changes are saved with an updated timestamp
   - Previous file attachments can be kept or replaced

4. **Deletion**:
   - User confirms deletion in a confirmation dialog
   - Application is permanently removed from storage

## Type System

The application uses TypeScript for type safety. Key types include:

### Job Interface
```typescript
export interface Job {
  id: string;                   // Unique identifier
  companyName?: string;         // Company name (optional)
  position?: string;            // Job position/title (optional)
  location?: string;            // Job location (optional)
  jobDescription?: string;      // Description of the job (optional)
  applicationDate?: string;     // ISO date string when applied (optional)
  status: ApplicationStatus;    // Current status (saved/applied)
  notes?: string;               // Personal notes (optional)
  salary?: string;              // Salary information (optional)
  url?: string;                 // Job posting URL (optional)
  contactName?: string;         // Recruiter/contact person (optional)
  contactEmail?: string;        // Contact email (optional)
  resumePath?: string;          // Path or data URL for resume (optional)
  coverLetterPath?: string;     // Path or data URL for cover letter (optional)
  lastUpdated: string;          // ISO date string of last update (required)
}
```

### Filter Interface
```typescript
export interface Filter {
  search: string;                            // Search text
  status: ApplicationStatus | 'all';         // Filter by status
  sortBy: 'date' | 'company' | 'status';     // Sort field
  sortOrder: 'asc' | 'desc';                 // Sort direction
}
```

### MongoDB Config Interface
```typescript
export interface MongoDBConfig {
  enabled: boolean;     // Whether MongoDB integration is enabled
  apiUrl?: string;      // API endpoint URL
}
```

## Storage Implementation

### Local Storage
The application uses the browser's localStorage API for client-side storage. Key functions:

- `getJobsFromLocalStorage()`: Retrieves all jobs from localStorage
- `getJobFromLocalStorage(id)`: Gets a specific job by ID
- `addJobToLocalStorage(job)`: Adds a new job
- `updateJobInLocalStorage(id, job)`: Updates an existing job
- `deleteJobFromLocalStorage(id)`: Removes a job

### MongoDB Storage
When MongoDB is enabled, the application communicates with the Express backend:

- `getJobs()`: Fetches all jobs via API GET request
- `getJob(id)`: Fetches a specific job via API GET request
- `addJob(jobData)`: Creates a job via API POST request
- `updateJob(job)`: Updates a job via API PUT request
- `deleteJob(id)`: Deletes a job via API DELETE request

### Automatic Failover
The storage functions are designed to automatically fall back to localStorage if MongoDB requests fail:

```typescript
export const getJobs = async (): Promise<Job[]> => {
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled) {
    try {
      // MongoDB request with timeout
      const response = await fetch(`${mongoConfig.apiUrl}/applications`);
      if (response.ok) {
        return await response.json();
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
```

## File Handling

### File Storage Approach
The application handles file uploads differently based on the storage mode:

1. **localStorage Mode**:
   - Files are converted to data URLs using `FileReader`
   - These data URLs are stored directly in the job object
   - Limitation: Large files may exceed localStorage capacity

2. **MongoDB Mode**: 
   - Files are uploaded to the server using `fetch` with FormData
   - Server stores files in the `uploads` directory
   - File paths are stored in the database
   - Files are served via static file middleware

### File Upload Implementation

```typescript
export const storeFile = async (file: File): Promise<string> => {
  const mongoConfig = getMongoDBConfig();
  
  if (mongoConfig.enabled) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${mongoConfig.apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.filePath;
      } else {
        throw new Error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file to server:', error);
      // Fallback to data URL
      return storeFileAsDataUrl(file);
    }
  } else {
    return storeFileAsDataUrl(file);
  }
};

const storeFileAsDataUrl = async (file: File): Promise<string> => {
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
```

## Error Handling Strategy

The application implements comprehensive error handling to provide a robust user experience:

### Network Error Handling
- All API requests include timeouts (5 seconds)
- Fetch operations are wrapped in try/catch blocks
- Network errors trigger fallback mechanisms
- Users receive toast notifications about connection issues

### Data Validation
- Input fields have validation rules (required fields, formats)
- Form submissions are validated before processing
- Database operations include type checking

### Graceful Degradation
- If MongoDB is unavailable, the app switches to localStorage
- If file uploads fail on the server, they're stored as data URLs
- If data fetching fails, empty states are displayed with retry options

### User Feedback
- Loading states are displayed during asynchronous operations
- Error messages explain what went wrong
- Success notifications confirm completed actions
- Status indicators show the current storage mode

## MongoDB Integration

### Database Schema
The MongoDB schema matches the Job interface with additional validation:

```javascript
const jobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyName: String,
  position: String,
  location: String,
  jobDescription: String,
  applicationDate: String,
  status: { type: String, enum: ['saved', 'applied'], default: 'applied' },
  notes: String,
  salary: String,
  url: String,
  contactName: String,
  contactEmail: String,
  resumePath: String,
  coverLetterPath: String,
  lastUpdated: { type: String, required: true }
});
```

### Backend Architecture
The Express backend provides these key endpoints:

- `/api/applications` - CRUD operations for job applications
- `/api/upload` - File upload handling
- `/api/files/:filename` - Serving uploaded files
- `/api/health` - Health check endpoint

### Connection Handling
The backend implements strategies to handle MongoDB connection issues:

```javascript
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing with local storage only');
  });
```

## Cross-Platform Considerations

The application is designed to work consistently across different operating systems:

### Windows-Specific Considerations
- Path separators use `path.join()` for cross-platform compatibility
- File permissions are handled differently for the uploads directory
- Line endings are normalized in text processing

### Unix-Based Systems (macOS/Linux)
- File permissions are set with appropriate access rights
- Script execution permissions are considered
- Environment variable usage is consistent across platforms

### General Cross-Platform Strategies
- Using cross-platform libraries (path, fs) with appropriate options
- Validating file paths before operations
- Using relative paths where possible
- Implementing appropriate error handling for different OS error codes

### Docker Support
For completely consistent environments, the application can be containerized:

```dockerfile
# Dockerfile example (not included in the project but documented here)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001 8080
CMD ["node", "start-app.js"]
```
