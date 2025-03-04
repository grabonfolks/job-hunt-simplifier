
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

// Start backend server
const backend = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: process.env
});

// Start frontend dev server
const frontend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: process.env
});

console.log('Starting Apply Archive...');
console.log('Backend: http://localhost:' + (process.env.PORT || 5001));
console.log('Frontend: http://localhost:8080');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  frontend.kill();
  process.exit(code);
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  backend.kill();
  process.exit(code);
});
