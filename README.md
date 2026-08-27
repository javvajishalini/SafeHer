# SafeHer

## Description
SafeHer is a Women Safety Platform designed to provide smart journey registration, location tracking, one-touch SOS, emergency response dashboard, and real-time communication features to empower and protect women.

## Objective
To develop a robust, AI-powered platform that ensures women's safety through real-time tracking, risk detection, and rapid emergency response.

## Technology Stack
- **Frontend**: React, TypeScript, Vite
- **Backend**: Java, Spring Boot, Maven
- **Database**: MongoDB
- **AI Service**: Python, FastAPI

## Project Architecture
React Frontend -> Spring Boot Backend -> MongoDB
Spring Boot Backend -> FastAPI AI Service

*Note: The web platform is being developed first. An Android application will be developed later and will reuse the same Spring Boot APIs.*

## Repository Structure
- `frontend/` - React frontend web application
- `backend/` - Spring Boot REST API
- `ai-service/` - FastAPI service for AI/ML functionality
- `docs/` - Project documentation
- `README.md` - Project overview and instructions

## Prerequisites
- Node.js (>= 18.x)
- Java (17 or higher)
- Maven (3.8.x or higher)
- Python (3.10 or higher)
- MongoDB

## Environment Variables
Create a `.env` file in the root directory and configure the environment variables as shown in the `.env.example` file.
```env
MONGODB_URI=
JWT_SECRET=
GOOGLE_MAPS_API_KEY=
AI_SERVICE_URL=
```

## Setup & Running Instructions

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend
Ensure MongoDB is running or configure `MONGODB_URI` properly.
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Health Check: `GET http://localhost:8080/api/health`

### 3. AI Service
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Health Check: `GET http://localhost:8000/health`

## Development Phases
Refer to `docs/development-phases.md` for the detailed feature roadmap.
