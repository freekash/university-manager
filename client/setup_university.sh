#!/bin/bash

# --- CONFIGURATION ---
PROJECT_NAME="UniversityManager"
CURRENT_DIR=$(pwd)
PROJECT_PATH="$CURRENT_DIR/$PROJECT_NAME"

echo "=========================================="
echo "🚀 STARTING AUTOMATED SETUP: $PROJECT_NAME"
echo "=========================================="

# 1. Create Project Directory
if [ -d "$PROJECT_NAME" ]; then
    echo "❌ Error: Directory '$PROJECT_NAME' already exists."
    echo "   Please delete it or rename the variable in the script."
    exit 1
fi

mkdir "$PROJECT_NAME"
cd "$PROJECT_NAME" || exit

echo "📂 Created Root Directory at: $PROJECT_PATH"

# ==========================================
# PHASE 1: BACKEND SETUP (Node + Express)
# ==========================================
echo "------------------------------------------"
echo "🛠  Setting up BACKEND (Server)..."
echo "------------------------------------------"

mkdir server
cd server || exit

# Initialize Node
npm init -y > /dev/null

# Install Dependencies
echo "⬇️  Installing Backend Packages (Express, Prisma, JWT, Nodemailer)..."
npm install express pg prisma @prisma/client cors dotenv jsonwebtoken bcryptjs nodemailer node-cron > /dev/null 2>&1
npm install --save-dev nodemon > /dev/null 2>&1

# Create Folders
mkdir -p src/controllers src/middleware src/routes src/utils prisma

# --- FILE GENERATION: .env ---
cat <<EOT > .env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/university_db"
JWT_SECRET="change_this_secret_in_prod"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
CLIENT_URL="http://localhost:5173"
EOT

# --- FILE GENERATION: prisma/schema.prisma ---
cat <<EOT > prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  HOD
  FACULTY
  INSTRUCTOR
  STUDENT
}

enum Status {
  PRESENT
  ABSENT
}

model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  password     String
  name         String
  role         Role      @default(STUDENT)
  departmentId Int?
  notifications Notification[]
  studentProfile StudentProfile?
}

model StudentProfile {
  id          Int      @id @default(autoincrement())
  userId      Int      @unique
  user        User     @relation(fields: [userId], references: [id])
  parentEmail String
  batch       String
}

model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
EOT

# --- FILE GENERATION: src/middleware/authMiddleware.js ---
cat <<EOT > src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  return next();
};

const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access Denied" });
  }
  next();
};

module.exports = { verifyToken, checkRole };
EOT

# --- FILE GENERATION: index.js ---
cat <<EOT > index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('University API is Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
EOT

# Add start scripts to package.json
npx json -I -f package.json -e 'this.scripts.start = "node index.js"'
npx json -I -f package.json -e 'this.scripts.dev = "nodemon index.js"'

cd .. 
# Back to Root

# ==========================================
# PHASE 2: FRONTEND SETUP (Vite + React)
# ==========================================
echo "------------------------------------------"
echo "🎨  Setting up FRONTEND (Client)..."
echo "------------------------------------------"

# Create Vite App
npm create vite@latest client -- --template react > /dev/null 2>&1

cd client || exit

# Install Dependencies
echo "⬇️  Installing Frontend Packages (Axios, Router, Tailwind)..."
npm install > /dev/null 2>&1
npm install axios react-router-dom lucide-react recharts > /dev/null 2>&1
npm install -D tailwindcss postcss autoprefixer > /dev/null 2>&1

# Initialize Tailwind
npx tailwindcss init -p > /dev/null 2>&1

# --- FILE GENERATION: tailwind.config.js ---
cat <<EOT > tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOT

# --- FILE GENERATION: src/index.css ---
cat <<EOT > src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
EOT

# Create Folders
mkdir -p src/components/Layout src/components/ui src/pages/admin src/pages/faculty src/pages/student src/context src/services

# --- FILE GENERATION: src/services/api.js ---
cat <<EOT > src/services/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = \`Bearer \${localStorage.getItem('token')}\`;
  }
  return req;
});

export default API;
EOT

# --- FILE GENERATION: src/App.jsx ---
cat <<EOT > src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex justify-center items-center">
        <h1 className="text-4xl font-bold text-blue-600">University Manager Setup Complete! 🚀</h1>
      </div>
    </BrowserRouter>
  );
}

export default App;
EOT

cd ..
# Back to Root

# ==========================================
# PHASE 3: FINALIZATION & LAUNCH
# ==========================================
echo "------------------------------------------"
echo "✅  Setup Complete!"
echo "------------------------------------------"

# Open in VS Code
if command -v code &> /dev/null; then
    echo "🖥️  Opening VS Code..."
    code .
else
    echo "⚠️  VS Code 'code' command not found."
    echo "   You can open it manually by running: code $PROJECT_NAME"
fi
