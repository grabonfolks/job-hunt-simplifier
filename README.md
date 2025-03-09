
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

## **💽 Project Structure**
```
apply-archive/
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── package.json          # Project dependencies
├── server.js             # Express backend
├── start-app.js          # Start script (Frontend + Backend)
├── uploads/              # Storage for uploaded files
├── src/                  # Frontend source
│   ├── App.tsx           # Main component with routing
│   ├── components/       # UI components
│   │   ├── ApplicationCard.tsx  # Job application card
│   │   ├── FileUpload.tsx       # File upload component
│   │   ├── SearchBar.tsx        # Search and filter
│   │   ├── StatCard.tsx         # Statistics card
│   │   ├── StatusBadge.tsx      # Application status badges
│   │   └── ui/                  # UI components from shadcn
│   ├── lib/              # Utilities
│   │   ├── storage.ts    # Storage logic (localStorage & MongoDB)
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

## **⚠️ Troubleshooting**

### MongoDB Connection Issues
- Ensure MongoDB is running (run `mongod` in terminal)
- Check your connection string in `.env`
- Verify network connectivity to MongoDB Atlas (if using cloud)
- The app will automatically fall back to localStorage if MongoDB is unavailable

### File Upload Problems
- Check that the `uploads` directory exists and has write permissions
- Maximum file size is limited to 50MB
- Supported file types: PDF, DOC, DOCX, TXT

### Cross-Platform Notes
- **Windows**: Ensure you have npm in your system PATH
- **macOS/Linux**: Standard commands work without modification
- If you encounter EACCES errors on Linux/Mac, use `sudo chmod -R 755 uploads/`
- For best results on Windows, run commands in a terminal with administrator privileges

### Common Errors
- **spawn npm ENOENT**: Make sure npm is installed and in your system PATH
- **PORT already in use**: Change the PORT in your .env file
- **MongoDB connection errors**: Verify that MongoDB is running and the connection string is correct

---

## **📝 License**
This project is licensed under the **MIT License** – free to use, modify, and share!  
Check the [LICENSE](./LICENSE) file for details.

---

## **⭐ Support & Share**
- **If you like this project, give it a ⭐ on GitHub!**  
- **Share with job seekers & friends** to help them manage their applications!  
- **Follow for updates! 🚀**  
