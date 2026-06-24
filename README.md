# BuildTrack – Home Construction Expense Tracker

A full-stack platform to help homeowners track house construction expenses, worker payments, material purchases, and overall budget in real time.

**Tech Stack**
- Frontend: React.js (Vite) + Tailwind CSS, Chart.js, PWA-enabled
- Backend: Node.js + Express.js
- Database: MongoDB (Mongoose) — MongoDB Atlas in production
- Auth: JWT + Email OTP verification (Nodemailer)
- Deployment: Frontend → Vercel, Backend → Render, DB → MongoDB Atlas

---

## 1. Project Structure

```
buildtrack/
├── client/          # React + Tailwind frontend
│   ├── src/
│   │   ├── components/   # Layout, Sidebar, Topbar, UI primitives
│   │   ├── pages/         # Login, Register, Dashboard, Projects, Expenses, Workers, Payments, Reports, Notifications, Admin
│   │   ├── context/       # AuthContext, ThemeContext, ProjectContext
│   │   └── services/      # Axios API client
│   ├── vercel.json
│   └── vite.config.js
├── server/          # Express backend
│   ├── models/      # User, Project, Expense, Worker, Payment, Notification, Category
│   ├── controllers/
│   ├── routes/
│   ├── middleware/  # auth, error handling, file upload
│   ├── utils/       # email, OTP, JWT, notifications, spending prediction
│   └── server.js
└── render.yaml
```

---

## 2. Features

- **Auth**: Registration with email OTP verification, login/logout, forgot/reset password, JWT-protected routes.
- **Dashboard**: Budget, spend, remaining budget, worker count, expense count, recent transactions, monthly + category charts.
- **Projects**: Multi-project support, create/edit/delete, share access with family members (view/edit permission).
- **Expenses**: Add/edit/delete with title, amount, category, date, description, bill image upload; filter by date/category; search.
- **Workers**: Add workers/contractors, track daily wage, payment history, outstanding totals.
- **Payments**: Record payments to workers, ledger view per project.
- **Reports**: Monthly + category analytics, worker payment report, PDF export, Excel export, simple linear-regression spend prediction.
- **Notifications**: Auto-triggered at 80% and 100%+ of project budget.
- **Advanced**: OCR bill-amount extraction (optional, via Tesseract.js), spend prediction, shared project access, admin panel, PWA installable app.

---

## 3. Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- A Gmail (or other SMTP) account with an **App Password** for sending OTP emails

### Backend

```bash
cd server
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, EMAIL_* etc.
npm install
npm run seed              # creates default categories + an admin user (admin@buildtrack.com / Admin@123)
npm run dev                # starts on http://localhost:5000
```

### Frontend

```bash
cd client
cp .env.example .env       # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # starts on http://localhost:5173
```

Open `http://localhost:5173`, register an account, check your email for the OTP, and verify.

> **Important:** change the default admin password immediately after first login in production.

### Enabling OCR (optional)
```bash
cd server
npm install tesseract.js
```
The `/api/expenses/ocr` endpoint will then automatically extract a likely bill amount from an uploaded image.

---

## 4. Backend API Reference

```
POST   /api/auth/register
POST   /api/auth/verify-otp
POST   /api/auth/resend-otp
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/share

GET    /api/expenses?project=&category=&from=&to=&search=&page=&limit=
POST   /api/expenses                (multipart/form-data, field: billImage)
GET    /api/expenses/:id
PUT    /api/expenses/:id
DELETE /api/expenses/:id
POST   /api/expenses/ocr            (multipart/form-data, field: bill)

GET    /api/workers?project=
POST   /api/workers
GET    /api/workers/:id
PUT    /api/workers/:id
DELETE /api/workers/:id

GET    /api/payments?worker=&project=
POST   /api/payments
DELETE /api/payments/:id

GET    /api/dashboard?project=

GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all

GET    /api/reports/analytics?project=
GET    /api/reports/pdf?project=
GET    /api/reports/excel?project=

GET    /api/admin/overview          (admin only)
GET    /api/admin/users             (admin only)
GET    /api/admin/projects          (admin only)
```

All routes except `/api/auth/*` require `Authorization: Bearer <token>`.

---

## 5. Database Collections

`Users`, `Projects`, `Expenses`, `Categories`, `Workers`, `Payments`, `Notifications`

---

## 6. Deployment Steps

### Step 1 — MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Add a database user and whitelist `0.0.0.0/0` (or Render's IPs) under Network Access.
3. Copy the connection string into `MONGO_URI`.

### Step 2 — Backend on Render
1. Push this repo to GitHub.
2. In Render, create a new **Web Service**, point it at the repo, set **Root Directory** to `server`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add environment variables from `server/.env.example` (use the Atlas URI, a strong `JWT_SECRET`, your SMTP credentials, and set `CLIENT_URL` to your Vercel domain once known).
5. Deploy. Note the resulting URL, e.g. `https://buildtrack-server.onrender.com`.

### Step 3 — Frontend on Vercel
1. In Vercel, import the same repo, set **Root Directory** to `client`.
2. Framework preset: Vite.
3. Add environment variable `VITE_API_URL=https://buildtrack-server.onrender.com/api`.
4. Deploy. Note the resulting URL, e.g. `https://buildtrack.vercel.app`.

### Step 4 — Connect CORS
1. Go back to Render → your backend service → environment variables.
2. Set `CLIENT_URL=https://buildtrack.vercel.app` and redeploy. This enables CORS for your live frontend (see `server/server.js`).

### Step 5 — Verify
- Visit your Vercel URL, register, verify OTP, log in, and create a project end-to-end.
- Check Render logs if OTP emails aren't arriving (most common cause: Gmail blocking non-App-Password logins — enable 2FA and create an App Password).

---

## 7. Notes & Limitations

- OCR is optional and degrades gracefully (returns HTTP 501 with a clear message) if `tesseract.js` isn't installed.
- Spend prediction uses simple linear regression over monthly totals — intended as a rough trend indicator, not financial advice.
- PWA install prompts depend on the browser; `vite-plugin-pwa` is pre-configured, just add real `icon-192.png` / `icon-512.png` files to `client/public/` before your first production build.
- File uploads are stored on the Render filesystem under `/uploads`, which is **ephemeral** on Render's free tier (files may be lost on redeploy). For production use, swap `multer.diskStorage` for an S3/Cloudinary adapter in `server/middleware/uploadMiddleware.js`.
