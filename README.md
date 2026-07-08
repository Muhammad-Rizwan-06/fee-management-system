# SmartPay FMS v2 — Unified Fee Management System

SmartPay is a modern, high-performance, and visually stunning web application designed to manage student fee cycles and vouchers. It is tailored for both schools and universities, supporting dual institutional setups with one-time configuration locking, class/session management, and per-period bulk billing rollovers.

---

## 🌟 Key Features

### 1. Dual-System Mode Configuration
At first admin login, the system prompts the administrator to configure the institutional structure. This selection is **permanent and cannot be modified later** for that account.
- **Semester System (University)**: Manages academic sessions (e.g., `2023-2027`). Fees are billed per semester (e.g., `1st Semester`, `2nd Semester`).
- **Annual System (School)**: Manages class levels (e.g., `Class 8`, `Class 10`). Fees are billed monthly/annually.

### 2. Group Management (Classes & Sessions)
- Dedicated groups tab in the dashboard.
- Create new classes/sessions and assign their initial billing periods and due dates.
- Real-time group metrics: student counts, paid/pending/unpaid breakdown.
- Validation checks to block group deletion if active students are assigned.

### 3. Fee Auditing & Verification Queue
- Real-time review desks for administrators to check uploaded challan receipt screenshots.
- One-click approval or rejection. Rejections allow custom comments returned directly to the student portal.
- Statistics dashboard: Total collected amount (PKR), pending amount, and student status metrics.

### 4. Bulk Billing Rollover
- Seamless rollover of billing periods per class/session.
- Automatically resets all assigned student fee statuses to `unpaid` for the next cycle.
- Retains full payment ledger history in the database so past transactions remain fully auditable.

### 5. Notice Board & Testimonials
- Global announcements broadcast to all students.
- Private direct messaging system for payment state changes.
- Integrated comments/testimonials feed submitted from the public landing page.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Lucide-React, Axios, React Router.
- **Backend**: Node.js, Express, Mongoose (MongoDB).
- **Authentication**: JSON Web Token (JWT) with secure local state handling.
- **Storage**: Multer storage configuration for profile photos and receipt images.

---

## 📂 Project Structure

```
fms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── context/        # AuthContext for state preservation
│   │   ├── pages/          # LandingPage, Admin/Student logins, Dashboards, Setup
│   │   ├── App.jsx         # Private route guards and router definitions
│   │   └── main.jsx
│   └── package.json
│
└── server/                 # Express backend API
    ├── controllers/        # Business logic controllers
    ├── middleware/         # Auth verification guards
    ├── models/             # Mongoose schemas (User, Student, Group, Challan)
    ├── routes/             # API routing
    ├── seed.js             # Initial database seeder script
    ├── server.js           # Server startup script
    └── package.json
```

---

## 🚀 Setup & Run Locally

### Prerequisites
Make sure you have Node.js (v16+) and MongoDB running on your system.

### 1. Server Setup
1. Open a terminal in the `server/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file inside the `server/` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/fee_management
   JWT_SECRET=supersecretkeyforfeemanagementsystem
   ```
4. Run the database seed script to populate initial users, default admin accounts, and student templates:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Client Setup
1. Open a terminal in the `client/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Seeding / Login Credentials

- **Administrator Accounts**:
  - Email: `admin@fms.com`
  - Password: `admin123`
- **Student Accounts** (Sample):
  - ID Card / CNIC: `42101-1234567-1`
  - Date of Birth: `2002-05-15`
