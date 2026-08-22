# HisabBook — Simple Loan & Interest Tracker

**HisabBook** is a production-ready, ledger-based loan and interest tracking application designed for irregular payment schedules. It handles automatic reducing-balance simple interest calculations, payment breakdowns, owner-isolated multi-user security, and PDF statement generation.

---

## 🌟 Key Features

- 🔐 **Firebase Authentication**: Email/Password and Google Sign-in integration with verified Firebase ID token authentication.
- 🛡️ **User Ownership & Isolation**: Data access is strictly isolated; User A cannot access or mutate User B's loans or payment records.
- 📊 **Irregular Payment Ledger Engine**: Dedicated financial calculation engine handling irregular payment dates and amounts without requiring fixed EMI schedules.
- 🧮 **Automatic Interest & Principal Breakdown**: Each payment automatically satisfies accrued interest to date before reducing remaining principal balance.
- 📄 **One-Click PDF Export**: Download readable, branded loan ledger statements formatted using `jsPDF`.
- 🌐 **Full Bilingual UI**: Simple, accessible interface with English and Hindi labels for non-technical users.
- 🛡️ **Production Security**: Helmet HTTP headers, IP rate-limiting, CORS restriction, MongoDB ObjectId validation, mass-assignment protection, and safe production error responses.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, React Router, Axios |
| **Backend** | Node.js, Express.js, Mongoose, Firebase Admin SDK |
| **Database** | MongoDB Atlas |
| **Authentication** | Firebase Authentication (Client & Admin SDK) |
| **PDF Generation** | jsPDF, jsPDF-AutoTable |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🏗️ Architecture & Data Flow

```text
Browser (Client App)
       │
       ▼ (HTTPS API Request with Bearer Token)
Vercel Frontend (React + Vite)
       │
       ▼ (HTTPS REST API / Authorization Header)
Render Backend (Node.js + Express)
       ├── Helmet Headers & Express Rate Limiter
       ├── Firebase Admin Token Verification
       ├── Owner Isolation & ObjectId Validation
       └── Reducing-Balance Ledger Calculation Service
       │
       ▼ (Encrypted Connection)
MongoDB Atlas Database
```

---

## ⚙️ Environment Variables Reference

> **IMPORTANT**: Never commit `.env` or secret key values to version control.

### Frontend Environment Variables (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Backend Environment Variables (`server/.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_atlas_connection_string
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json_string
FIREBASE_PROJECT_ID=your_firebase_project_id
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+ and npm v9+
- MongoDB Atlas cluster URI
- Firebase Project with Email/Password & Google Sign-in enabled

### 1. Backend Setup

```bash
cd server
cp .env.example .env
# Fill in MONGODB_URI, FIREBASE_PROJECT_ID, etc.
npm install
npm run dev
```

Server runs at `http://localhost:5000`. Health check: `GET /api/health`

### 2. Frontend Setup

```bash
cd client
cp .env.example .env
# Fill in VITE_API_URL, VITE_FIREBASE_* keys
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## 🧪 Testing Suites

```bash
# Run calculation engine unit tests
cd server
node src/services/loanCalculation/loanCalculation.test.js

# Run 10-scenario financial audit test suite
node src/tests/financialAudit.test.js

# Run automated user isolation & integration test suite
node src/tests/integration.test.js

# Run frontend build check
cd ../client
npm run build
```

---

## 📡 API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Server health check | No |
| `GET` | `/api/loans` | Get user's loans (with ledger stats) | Yes |
| `POST` | `/api/loans` | Create a new loan | Yes |
| `GET` | `/api/loans/:id` | Get loan details and payment history | Yes |
| `PUT` | `/api/loans/:id` | Edit loan details or status | Yes |
| `DELETE` | `/api/loans/:id` | Delete loan and cascade delete payments | Yes |
| `POST` | `/api/loans/:loanId/payments` | Record a payment on a loan | Yes |
| `GET` | `/api/loans/:loanId/payments` | Get payment records for a loan | Yes |
| `PUT` | `/api/payments/:paymentId` | Edit a payment record | Yes |
| `DELETE` | `/api/payments/:paymentId` | Delete a payment record | Yes |

---

## 🚀 Deployment Instructions

### 1. MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database Cluster.
3. Under **Database Access**, create a user with read/write access.
4. Under **Network Access**, add `0.0.0.0/0` (or Render IP addresses).
5. Copy the connection string into `MONGODB_URI`.

### 2. Firebase Authentication Setup
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Enable **Email/Password** and **Google** sign-in under Authentication -> Sign-in method.
3. Add your Vercel production domain under **Authentication -> Settings -> Authorized Domains**.
4. Generate a Service Account key under **Project Settings -> Service accounts** for backend `FIREBASE_SERVICE_ACCOUNT`.

### 3. Backend Deployment (Render)
1. Log in to [Render](https://render.com/) and create a **Web Service**.
2. Connect your GitHub repository.
3. Set **Root Directory**: `server`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add environment variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-app.vercel.app`
   - `MONGODB_URI`: `your_mongodb_atlas_uri`
   - `FIREBASE_SERVICE_ACCOUNT`: `your_firebase_service_account_json`
   - `FIREBASE_PROJECT_ID`: `your_project_id`

### 4. Frontend Deployment (Vercel)
1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Select your GitHub repository.
3. Set **Root Directory**: `client`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add environment variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - `VITE_FIREBASE_*`: Your Firebase Web app credentials
7. Deploy! Vercel SPA routing is configured via `client/vercel.json`.

---

## 📷 Screenshots

*(Placeholder for application UI screenshots)*
- **Dashboard Overview**: Summary stats & active loan cards.
- **Loan Details Page**: Ledger breakdown cards, payment table, and PDF export.
- **Add Payment Form**: Fast payment recording with instant ledger recalculation.

---

## 🔮 Future Improvements

- 📲 SMS / WhatsApp payment receipt sharing.
- 🔔 Automated payment reminders.
- 🌐 Offline PWA (Progressive Web App) support.

---

## 📄 License

Private / Proprietary — All rights reserved.
