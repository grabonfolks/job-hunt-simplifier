
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if .env file exists
const envFile = join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  console.log('\x1b[33m%s\x1b[0m', 'Warning: No .env file found. Creating from .env.example...');
  try {
    const exampleContent = fs.readFileSync(join(__dirname, '.env.example'), 'utf8');
    fs.writeFileSync(envFile, exampleContent);
    console.log('\x1b[32m%s\x1b[0m', '.env file created successfully!');
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Error creating .env file:', err);
  }
}

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Apply Archive...');

// Start backend server
console.log('\x1b[36m%s\x1b[0m', '📡 Starting backend server...');
const backend = spawn('node', ['--experimental-modules', 'server.js'], {
  stdio: 'inherit',
  env: process.env,
  shell: true  // Add shell: true for Windows compatibility
});

// Wait a bit for the backend to initialize before starting frontend
setTimeout(() => {
  // Start frontend dev server
  console.log('\x1b[36m%s\x1b[0m', '🖥️  Starting frontend server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: process.env,
    shell: true  // Add shell: true for Windows compatibility
  });

  // Log URLs
  const PORT = process.env.PORT || 5001;
  console.log('\x1b[32m%s\x1b[0m', `Backend URL: http://localhost:${PORT}`);
  console.log('\x1b[32m%s\x1b[0m', 'Frontend URL: http://localhost:8080');
  console.log('\x1b[33m%s\x1b[0m', 'Press Ctrl+C to stop all servers');

  // Handle frontend process termination
  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    backend.kill('SIGINT');
    process.exit(code);
  });
}, 2000); // 2 second delay to allow backend to start

// Handle backend process termination
backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\x1b[33m%s\x1b[0m', 'Shutting down Apply Archive...');
  backend.kill('SIGINT');
  process.exit(0);
});
