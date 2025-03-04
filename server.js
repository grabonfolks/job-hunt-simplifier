
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

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

// Connect to MongoDB with error handling
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing with local storage only');
  });

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = `/api/files/${req.file.filename}`;
    res.json({ filePath });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Serve uploaded files
app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath);
});

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get application by ID
app.get('/api/applications/:id', async (req, res) => {
  try {
    const job = await Job.findOne({ id: req.params.id });
    if (!job) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Create application
app.post('/api/applications', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating application:', error);
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
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete application
app.delete('/api/applications/:id', async (req, res) => {
  try {
    const result = await Job.findOneAndDelete({ id: req.params.id });
    
    if (!result) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// Health check endpoint with improved error handling
app.get('/api/health', (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({ status: 'ok', message: 'API server is running and connected to MongoDB' });
    } else {
      res.status(200).json({ 
        status: 'limited', 
        message: 'API server is running but not connected to MongoDB. Using local storage mode.' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'API server error', 
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log('Health check: http://localhost:' + PORT + '/api/health');
});

// Add proper error handling for unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  // Don't crash the server, just log the error
});
