
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Create a simple logger for server-side logging
const logger = {
  info: (message, data) => {
    console.info(`[${new Date().toISOString()}] [INFO] ${message}`, data || '');
  },
  error: (message, error) => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, error || '');
    
    // Log to error log file if configured
    if (process.env.ERROR_LOG_PATH) {
      try {
        const logDir = path.dirname(process.env.ERROR_LOG_PATH);
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logEntry = `[${new Date().toISOString()}] ${message}\n${error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : ''}\n\n`;
        fs.appendFileSync(process.env.ERROR_LOG_PATH, logEntry);
      } catch (logError) {
        console.error('Failed to write to error log file:', logError);
      }
    }
  },
  warn: (message, data) => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, data || '');
  },
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] [DEBUG] ${message}`, data || '');
    }
  }
};

// Get current directory name (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  
  // Log response when it completes
  const originalSend = res.send;
  res.send = function(body) {
    logger.debug(`Response ${res.statusCode} for ${req.method} ${req.url}`);
    return originalSend.call(this, body);
  };
  
  next();
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// MongoDB Schema
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

const Job = mongoose.model('Job', jobSchema);

// Connect to MongoDB with improved error handling
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB successfully'))
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    logger.warn('Continuing with local storage only');
  });

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = `/api/files/${req.file.filename}`;
    logger.info('File uploaded successfully', { filename: req.file.filename });
    res.json({ filePath });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Serve uploaded files
app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath, err => {
    if (err) {
      logger.error('File serving error:', { filename: req.params.filename, error: err });
      // Don't send error response as it would be a duplicate
    }
  });
});

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const jobs = await Job.find();
    logger.debug('Fetched all applications', { count: jobs.length });
    res.json(jobs);
  } catch (error) {
    logger.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get application by ID
app.get('/api/applications/:id', async (req, res) => {
  try {
    const job = await Job.findOne({ id: req.params.id });
    if (!job) {
      logger.warn('Application not found', { id: req.params.id });
      return res.status(404).json({ error: 'Application not found' });
    }
    logger.debug('Fetched application by ID', { id: req.params.id });
    res.json(job);
  } catch (error) {
    logger.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Create application
app.post('/api/applications', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    logger.info('Application created', { id: newJob.id });
    res.status(201).json(newJob);
  } catch (error) {
    logger.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Update application
app.put('/api/applications/:id', async (req, res) => {
  try {
    const updatedJob = await Job.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    
    if (!updatedJob) {
      logger.warn('Failed to update application - not found', { id: req.params.id });
      return res.status(404).json({ error: 'Application not found' });
    }
    
    logger.info('Application updated', { id: req.params.id });
    res.json(updatedJob);
  } catch (error) {
    logger.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete application
app.delete('/api/applications/:id', async (req, res) => {
  try {
    const result = await Job.findOneAndDelete({ id: req.params.id });
    
    if (!result) {
      logger.warn('Failed to delete application - not found', { id: req.params.id });
      return res.status(404).json({ error: 'Application not found' });
    }
    
    logger.info('Application deleted', { id: req.params.id });
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    logger.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// Health check endpoint with improved error handling
app.get('/api/health', (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.debug('Health check - MongoDB connected');
      res.json({ status: 'ok', message: 'API server is running and connected to MongoDB' });
    } else {
      logger.warn('Health check - MongoDB not connected');
      res.status(200).json({ 
        status: 'limited', 
        message: 'API server is running but not connected to MongoDB. Using local storage mode.' 
      });
    }
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'API server error', 
      error: error.message 
    });
  }
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  logger.error('Unhandled server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Create HTTP server explicitly for better error handling
const server = http.createServer(app);

// Handle socket errors properly
server.on('clientError', (err, socket) => {
  logger.error('Client socket error:', err);
  if (socket.writable && !socket.destroyed) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
  }
});

// Add proper error handler for the server
server.on('error', (error) => {
  logger.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  }
});

// Start server with improved error handling
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API URL: http://localhost:${PORT}/api`);
  logger.info('Health check: http://localhost:' + PORT + '/api/health');
});

// Add proper error handling for unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection:', error);
  // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't crash the server on uncaught exceptions either
});
