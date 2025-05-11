# SCD_Containerization_K8s_Project

# OASIS Hospital Management System

## Overview
OASIS is a comprehensive healthcare management system designed to streamline interactions between patients, doctors, and administrators. The platform facilitates appointment booking, medical record management, and healthcare service delivery through an intuitive digital interface.

## Features

### User Authentication & Authorization
- Multi-role login system (Patient, Doctor, Admin)
- Secure password management
- Password reset functionality
- Role-based access control

### Patient Features
- Appointment scheduling
- Medical records access
- Lab report viewing
- Online payment processing
- Emergency contact management
- Real-time chat with doctors
- Prescription history

### Doctor Features
- Appointment management
- Prescription writing
- Lab report sharing
- Patient history access
- Schedule management
- Profile customization
- Patient communication system

### Admin Features
- User management
- Department administration
- System monitoring
- Registration oversight
- Analytics dashboard

## Technical Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Lucide React Icons
- Axios
- React Router v6


## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation
1. Clone the repository
https://github.com/musfirah111/SCD_Containerization_K8s_Project.git

2. Install dependencies: npm install
3. Configure environment variables
4. Start development server: npm run dev


### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will be running at `http://localhost:5173`.

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd ../backend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory and add your MongoDB connection string:

   ```plaintext
   MONGO_URI="mongodb://localhost:27017/OasisHospitalManagementSystem"
   PORT=5000
   ```

4. Start the backend server:

   ```bash
   node server.js
   ```

   The backend will be running at `http://localhost:5000`.
   