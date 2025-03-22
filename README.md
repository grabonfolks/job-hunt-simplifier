# **Apply Archive - Job Application Tracker** 🎯

A **free & open-source job application tracker** to organize your job search efficiently!  
Track applications, store resumes, search/filter jobs, and **never lose track of your applications again!**  

🚀 **Live Demo**: [Apply Archive](https://apply-archive-demo.netlify.app)  
⭐ **Star the Repo**: [GitHub Repository](https://github.com/yourusername/apply-archive)

---

## **✨ Features**
✔️ **Track Job Applications** – Store company names, job descriptions, dates, and statuses  
✔️ **Resume & Cover Letter Management** – Upload and organize documents  
✔️ **Search & Filter** – Quickly find applications by company name or role  
✔️ **Dual Storage Support** – Use **LocalStorage (no backend)** or **MongoDB (persistent storage)**  
✔️ **Intuitive UI** – Clean, minimal UI built with React & Tailwind CSS  
✔️ **Fully Responsive** – Works on desktops, tablets, and mobile devices  
✔️ **Robust Error Handling** – Graceful fallbacks and informative user feedback  
✔️ **Comprehensive Logging** – Detailed error and event logging  
✔️ **Dark Mode Support** – Toggle between light and dark themes  

---

## **📺 Screenshots**
| Dashboard View | Add Application | Search & Filter |
|---------------|----------------|----------------|
| ![Dashboard](./assets/dashboard.png) | ![Add Job](./assets/add-job.png) | ![Search](./assets/search-filter.png) |

---

## **💠 Storage Modes**
This application works in two modes:
1. **LocalStorage Mode** (Frontend-only, no setup required)
2. **MongoDB Mode** (Persistent storage, requires backend setup)

The app automatically detects the availability of MongoDB and falls back to LocalStorage if the database connection fails.

---

## **🚀 Installation Guide**
### **1️⃣ Prerequisites**
Ensure you have the following installed:
- **[Node.js](https://nodejs.org/)** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (optional, only for persistent storage)

### **2️⃣ Clone the Repository**
```sh
git clone https://github.com/yourusername/apply-archive.git
cd apply-archive
```

### **3️⃣ Install Dependencies**
Install all required packages with a single command:
```sh
npm install react react-dom react-router-dom @tanstack/react-query zod react-hook-form @hookform/resolvers date-fns uuid cors dotenv express mongoose multer
```

Or if you prefer yarn:
```sh
yarn add react react-dom react-router-dom @tanstack/react-query zod react-hook-form @hookform/resolvers date-fns uuid cors dotenv express mongoose multer
```

### **4️⃣ Configure Environment Variables**
Create a `.env` file in the root directory and copy the content from `.env.example`:
```sh
# MongoDB Connection String 
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/applyarchive

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/applyarchive?retryWrites=true&w=majority

# Frontend environment variables
# Set to "true" to enable MongoDB integration in the frontend
# Set to any other value or remove to use localStorage only
VITE_MONGODB_URI=true

# The URL of your API server - must match the server's port (default is 5001)
VITE_API_URL=http://localhost:5001/api

# Server port
PORT=5001

# Optional: Error log file path (logs all server errors)
# ERROR_LOG_PATH=./logs/error.log
```

### **5️⃣ MongoDB Setup**
For persistent storage, you'll need MongoDB:

#### **Local MongoDB Installation:**
- **Windows:**
  1. Download MongoDB Community Server from [MongoDB's official site](https://www.mongodb.com/try/download/community)
  2. Run the installer and follow the installation wizard
  3. Choose "Complete" installation and install MongoDB Compass (GUI) when prompted
  4. MongoDB service will start automatically, verify it's running in Services
  5. Create a `data\db` directory with `mkdir -p /data/db` (in admin PowerShell)

- **macOS:**
  1. Using Homebrew: `brew tap mongodb/brew && brew install mongodb-community`
  2. Start the service: `brew services start mongodb-community`

- **Linux (Ubuntu):**
  1. Import MongoDB public key: `wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -`
  2. Create list file: `echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list`
  3. Update and install: `sudo apt-get update && sudo apt-get install -y mongodb-org`
  4. Start MongoDB: `sudo systemctl start mongod`

#### **MongoDB Atlas (Cloud) Setup:**
MongoDB Atlas is a fully managed cloud database service that's perfect if you don't want to install MongoDB locally:

1. **Create a MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account
   - No credit card required for the free tier

2. **Create a New Project & Cluster:**
   - Log in to your MongoDB Atlas account
   - Click "Create" to start a new project
   - Name your project (e.g., "ApplyArchive")
   - Click "Create Project"
   - Click "Build a Database" and select "Free" (Shared) tier
   - Choose your preferred cloud provider (AWS, Google Cloud, or Azure)
   - Select a region closest to you for best performance
   - Keep the default cluster name (Cluster0) or rename it
   - Click "Create Cluster" (This process takes 1-3 minutes)

3. **Set Up Database Security:**
   - While the cluster is being created, you'll be prompted to create a database user
   - Username: Create a username (remember this)
   - Password: Create a secure password or use the "Autogenerate Secure Password" option (save this password!)
   - Select "Built-in Role" as "Atlas admin"
   - Click "Create User"

4. **Configure Network Access:**
   - Go to the "Network Access" tab
   - Click "Add IP Address"
   - For development, you can select "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, enter your application server's IP address
   - Click "Confirm"

5. **Get Your Connection String:**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual database user's password
   - Replace `myFirstDatabase` with `applyarchive` or your preferred database name

6. **Add Connection String to Your .env File:**
   ```
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/applyarchive?retryWrites=true&w=majority
   ```

7. **Verify Connection:**
   - Start your application
   - Check the health endpoint: `http://localhost:5001/api/health`
   - It should show "API server is running and connected to MongoDB"

#### **MongoDB Atlas Free Tier Limitations:**
- 512MB of storage (sufficient for thousands of job applications)
- Shared RAM and vCPU
- Data is automatically replicated for high availability
- Automatic backups
- Clusters on M0 free tier will pause after 60 days of inactivity

#### **Verify MongoDB Connection:**
After starting MongoDB, verify it's running:
```sh
# For local MongoDB
mongosh

# For MongoDB Atlas, use the connection string from the Atlas dashboard
mongosh "mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/applyarchive"

# Should connect and display MongoDB shell version
```

---

## **🎯 Running the Application**
### **🔥 Quick Start (Both Frontend & Backend)**
Run everything with **one command**:
```sh
node start-app.js
```
💪 **Backend**: http://localhost:5001  
💪 **Frontend**: http://localhost:8080  

### **📌 LocalStorage Mode (Frontend Only)**
If you don't want to set up a database, run:
```sh
npm run dev
```
💪 **Available at**: http://localhost:8080  

### **📁 MongoDB Mode (Persistent Storage)**
Start the backend:
```sh
node server.js
```
Then, start the frontend:
```sh
npm run dev
```

---

## **🛠 API Endpoints (MongoDB Mode)**
| Method | Endpoint | Description |
|--------|---------|-------------|
| **GET** | `/api/applications` | Get all job applications |
| **GET** | `/api/applications/:id` | Get a specific application |
| **POST** | `/api/applications` | Create a new application |
| **PUT** | `/api/applications/:id` | Update an application |
| **DELETE** | `/api/applications/:id` | Delete an application |
| **GET** | `/api/health` | Check API and MongoDB connection |
| **POST** | `/api/upload` | Upload resume or cover letter files |

---

## **📊 Logging**

The application has comprehensive logging built in:

### **Server-Side Logging**
- API requests and responses are logged to the console
- All MongoDB operations are logged
- Errors are captured and logged in detail
- Optional file logging can be enabled by setting ERROR_LOG_PATH in .env

### **Client-Side Logging**
- Critical errors are saved to localStorage for troubleshooting
- Network errors, data validation issues, and API problems are tracked
- Logs can be retrieved for debugging purposes

---

## **💽 Project Structure**
```
apply-archive/
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── package.json          # Project dependencies
├── server.js             # Express backend
├── start-app.js          # Start script (Frontend + Backend)
├── uploads/              # Storage for uploaded files
├── logs/                 # Error logs (if enabled)
├── src/                  # Frontend source
│   ├── App.tsx           # Main component with routing
│   ├── components/       # UI components
│   │   ├── ApplicationCard.tsx  # Job application card
│   │   ├── FileUpload.tsx       # File upload component
│   │   ├── SearchBar.tsx        # Search and filter
│   │   ├── StatCard.tsx         # Statistics card
│   │   ├── StatusBadge.tsx      # Application status badges
│   │   ├── ThemeToggle.tsx      # Dark/light mode toggle
│   │   └── ui/                  # UI components from shadcn
│   ├── lib/              # Utilities
│   │   ├── storage.ts    # Storage logic (localStorage & MongoDB)
│   │   ├── logger.ts     # Logging utility
│   │   └── utils.ts      # Utility functions
│   ├── pages/            # App pages
│   │   ├── AddApplication.tsx   # Add new application
│   │   ├── EditApplication.tsx  # Edit existing application
│   │   ├── Index.tsx            # Main dashboard
│   │   ├── NotFound.tsx         # 404 page
│   │   └── ViewApplication.tsx  # View application details
│   ├── types/            # TypeScript types
│   │   └── types.ts             # Type definitions
│   ├── main.tsx          # Application entry point
│   └── vite.config.ts    # Vite configuration
└── README.md             # This file!
```

---

## **⚠️ Troubleshooting**

### MongoDB Connection Issues
- Ensure MongoDB is running (run `mongod` in terminal for local MongoDB)
- For MongoDB Atlas, check your IP whitelist settings
- Verify your connection string in `.env`
- Double-check your MongoDB Atlas username and password
- Ensure your database user has the correct permissions
- For Atlas connection issues, try using the "Connect" button in the Atlas dashboard and test with MongoDB Compass
- The app will automatically fall back to localStorage if MongoDB is unavailable

### File Upload Problems
- Check that the `uploads` directory exists and has write permissions
- Maximum file size is limited to 50MB
- Supported file types: PDF, DOC, DOCX, TXT

### Cross-Platform Notes
- **Windows**: 
  - Ensure you have npm in your system PATH
  - If you get "spawn npm ENOENT" error, try running `where npm` to verify npm is accessible
  - Make sure Node.js is properly installed and in your PATH
  - Try running commands in PowerShell or Command Prompt with administrator privileges
- **macOS/Linux**: Standard commands work without modification
- If you encounter EACCES errors on Linux/Mac, use `sudo chmod -R 755 uploads/`
- For best results on Windows, run commands in a terminal with administrator privileges

### Common Errors
- **spawn npm ENOENT**: 
  - Make sure npm is installed and in your system PATH 
  - On Windows, try using `npm.cmd` instead of `npm` in scripts
  - Restart your terminal or command prompt after installing Node.js
- **PORT already in use**: Change the PORT in your .env file
- **MongoDB connection errors**: Verify that MongoDB is running and the connection string is correct

---

## **🌍 Contributing**
Want to contribute? Follow these steps:

1. **Fork the repository** 🍞
2. Clone your fork:
   ```sh
   git clone https://github.com/yourusername/apply-archive.git
   ```
3. Create a new branch:
   ```sh
   git checkout -b feature/your-feature
   ```
4. Commit changes:
   ```sh
   git add .
   git commit -m "Added a new feature"
   ```
5. Push & create a **Pull Request**! 🚀

---

## **📝 License**
This project is licensed under the **MIT License** – free to use, modify, and share!  
Check the [LICENSE](./LICENSE) file for details.

---

## **⭐ Support & Share**
- **If you like this project, give it a ⭐ on GitHub!**  
- **Share with job seekers & friends** to help them manage their applications!  
- **Follow for updates! 🚀**
