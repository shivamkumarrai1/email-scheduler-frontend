# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

# Email Scheduler App

## Live Demo

- **Frontend:** [https://email-scheduler-frontend-rh3f.vercel.app/](https://email-scheduler-frontend-rh3f.vercel.app/)
- **Backend API:** [https://email-scheduler-backend.onrender.com](https://email-scheduler-backend.onrender.com)

## Table of Contents
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

---

## Project Structure

```
my-app/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── ...
│
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    ├── .env (optional)
    └── ...
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or above recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (for database)
- [Vercel](https://vercel.com/) account (for frontend deployment)
- [Render](https://render.com/) or [Heroku](https://heroku.com/) account (for backend deployment)

---

## Backend Setup

1. **Clone the repository and navigate to the backend folder:**
   ```bash
   git clone https://github.com/shivamkumarrai1/email-scheduler-backend.git
   cd email-scheduler-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file in the backend folder:**
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=5000
   ```

4. **Run the backend locally:**
   ```bash
   npm start
   ```
   The backend will run on [http://localhost:5000](http://localhost:5000).

---

## Frontend Setup

1. **Navigate to the frontend folder:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Create a `.env` file for environment variables:**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api/email/schedule
   ```

4. **Run the frontend locally:**
   ```bash
   npm start
   ```
   The frontend will run on [http://localhost:3000](http://localhost:3000).

---

## Running Locally

- Start the backend (`npm start` in `/backend`)
- Start the frontend (`npm start` in `/frontend`)
- Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Deployment

### **Backend (Render)**
1. Push your backend code to GitHub.
2. Create a new Web Service on [Render](https://render.com/).
3. Connect your GitHub repo.
4. Set the build command: `npm install`
5. Set the start command: `npm start`
6. Add your `MONGODB_URI` environment variable in the Render dashboard.
7. Deploy and note your backend URL.

### **Frontend (Vercel)**
1. Push your frontend code to GitHub.
2. Import your repo on [Vercel](https://vercel.com/).
3. Set the root directory if needed (e.g., `frontend`).
4. Set build command: `npm run build`
5. Set output directory: `build`
6. (Optional) Add `REACT_APP_API_URL` environment variable if your code uses it.
7. Deploy and note your frontend URL.

---

## Environment Variables

### **Backend**
- `MONGODB_URI` – Your MongoDB Atlas connection string
- `PORT` – Port to run the server (default: 5000)

### **Frontend**
- `REACT_APP_API_URL` – (Optional) Your backend API endpoint

---

## Testing

### **Run frontend tests:**
```bash
npm test
```

### **Run backend tests:**
- (Add backend tests as needed)

---

## API Endpoints

### **POST /api/email/schedule**
- **Description:** Schedule an email to be sent after 1 hour.
- **Body:**
  ```json
  {
    "from": "your.email@gmail.com",
    "pass": "your_app_password",
    "to": "recipient@gmail.com",
    "subject": "Test Email",
    "body": "This is a test email."
  }
  ```

### **GET /health**
- **Description:** Health check endpoint.

---

## Troubleshooting

- **502/500 errors:** Check your backend logs on Render.
- **CORS errors:** Ensure CORS is enabled in your backend.
- **Build errors on Vercel:** Make sure `react-scripts` is in dependencies and the correct root directory is set.
- **MongoDB connection errors:** Double-check your `MONGODB_URI` and network access in MongoDB Atlas.

---

**For more help, open an issue or contact the maintainer.**
