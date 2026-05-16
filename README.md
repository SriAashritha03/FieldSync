# FieldSync

FieldSync is a web dashboard + mobile-friendly form system for NGO field data collection. Field workers submit structured beneficiary and activity data. Admins view dashboards, generate AI summaries, and drill into full submission details with media.

## Features
- Role-based access (admin/worker)
- Mobile-friendly submission form with consent, geo capture, and media uploads
- Centralized data store with search and filters
- AI summaries and insights via Google AI Studio (Gemini)
- Detailed submission view with full metadata and photos/videos

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas (Mongoose)
- AI: Google AI Studio (Gemini)

## Project Structure
- backend/
  - server.js: Express app + routes + static uploads
  - config/db.js: MongoDB connection
  - models/: Mongoose schemas
  - controllers/: Request handlers
  - routes/: API endpoints
  - middleware/: Auth, error handling, uploads
- frontend/
  - src/pages/: App screens
  - src/components/: UI components
  - src/services/: API clients
  - src/context/: Auth state

## Environment Variables
### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>
JWT_SECRET=change_this_secret
CLIENT_ORIGIN=http://localhost:5173
GOOGLE_API_KEY=your_google_api_key
GOOGLE_MODEL=gemini-1.5-flash
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Install and Run (Local)
### Backend
```
cd backend
npm install
npm run dev
```

### Frontend
```
cd frontend
npm install
npm run dev
```

## Build (Frontend)
```
cd frontend
npm run build
npm run preview
```

## API Endpoints (Backend)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/submissions (supports multipart media)
- GET /api/submissions (filters: search, region, activityType, projectCode, beneficiaryId, from, to)
- GET /api/submissions/metrics
- GET /api/submissions/:id
- GET /api/reports/summary (admin)
- GET /api/reports/insights (admin)

## Submission Data (Key Fields)
- Beneficiary: identifier, name, gender, age/DOB, phones, address, village, vulnerabilityStatus, consentGiven
- Project: code, name
- M&E: beneficiaryCount, itemsDistributed, trainingHours, targetBeneficiaries, fundsDisbursed
- Feedback: qualitative, satisfaction
- Staff: staffId, staffName
- Geo: lat, lng, accuracy, capturedAt
- Offline: isOffline, syncedAt
- Media: uploaded images/videos (served from /uploads)

## AI Notes
AI summaries and insights are generated in backend/controllers/reportController.js using Gemini. If AI fails, the API falls back to rule-based text.

## Deployment Notes (Render)
- Use two services: frontend static site + backend web service.
- Backend start command: node server.js
- MongoDB Atlas: add Render IPs or 0.0.0.0/0 to the IP access list.

## Security
- Keep .env private. Do not commit real API keys.
