# 🌐 Orpon — Transparent Donation Management System

A transparent and tamper-evident donation platform built using modern web technologies.  
Orpon ensures accountability in online donations through public transaction visibility, integrity verification, and cryptographic hash-chain validation.

---

# 📖 Overview

Orpon is an academic full-stack web application designed to improve transparency in donation systems.

Traditional donation platforms often lack:
- Public accountability
- Tamper detection
- Donation verification
- Donor privacy controls

Orpon solves these issues by introducing:
- Public donation ledger
- Anonymous and pseudonymous donations
- Transaction verification
- Hash-chain integrity system
- Blockchain-ready architecture with automated batch-ready transaction flows

---

# 🎯 Project Objectives

- Build a transparent donation platform
- Prevent hidden modification of donation records
- Provide public visibility of transactions
- Allow secure and anonymous donations
- Create a scalable blockchain-ready architecture

---

# 🌍 Deployed Application

- **Frontend:** https://thankful-sea-0f5fbd000.7.azurestaticapps.net/
- **Backend API:** https://orpon-backend-api-sea.azurewebsites.net/api

---

# 🏗️ System Architecture

```text
Frontend (React + Vite)
        ↓
Backend API (Node.js + Express)
        ↓
MySQL Database (Integrity Verification Check)
        ↓
SHA-256 Hash Chain (Genesis to Current Block)
        ↓
Blockchain Anchoring (Polygon Testnet Sandbox Ready)
```

---

# 🛠️ Tech Stack

## Frontend
- React.js (v19)
- Vite
- React Router DOM (v6)
- Tailwind CSS
- Lucide React (Icons)
- QRCode SVG (For link sharing)

## Backend
- Node.js
- Express.js
- MySQL (with automated schema migrations)

## Security & Integrity
- SHA-256 Cryptographic Hashing
- Cryptographic Hash Chain Validation
- Privacy Preserving Pseudonym Generation

## Payment Gateway Sandbox Integrations
- **bKash**: Official Tokenized Checkout Sandbox API (with token grant/create/execute endpoints)
- **Nagad**: Local Interactive Checkout Simulator (OTP/PIN verification validation)
- **Card Payments (SSLCommerz)**: Official SSLCommerz Sandbox Hosted Gateway (with Validator API check)

## Future Blockchain Integration
- Polygon Amoy Testnet (Planned)
- ethers.js (v6)

---

# 👥 User Roles

## 👤 Donor/User
Users who make donations and verify transparency.

### Features:
- Browse active campaigns
- Make donations configuration
- Choose privacy tier (Public name, Anonymous, or Pseudonym)
- Pay securely using bKash, Nagad, or Cards
- View public transaction ledger
- View recent transactions directly on the campaign page
- Verify transaction integrity

---

## 👨‍💼 Admin / NGO Manager
Administrators who manage transparency verification and monitor system activities.

### Features:
- Monitor all transactions
- Verify hash chain integrity
- Manage public ledger
- Trigger batch verification
- View transparency reports

---

# ✨ Core Features

## ✅ Anonymous Donations
Users can donate while protecting their identity.

### Privacy Options:
- **Public Name**: Shows the donor's full name.
- **Anonymous**: Real name is hidden; display name shows as `Anonymous`.
- **Pseudonym**: Real name is hidden; system dynamically generates a randomized pseudonym (e.g., `Donor-4821`).

---

## ✅ Public Transaction Ledger
A publicly accessible ledger displaying:
- Donation BDT amount
- Timestamp
- Payment gateway method
- Cryptographic transaction hash
- Verification status

---

## ✅ Campaign "Recent Transactions" Panel
A live, responsive transactions table embedded directly inside the Campaign Progress Card displaying:
- **Donor Name** (respecting privacy choices)
- **BDT Amount**
- **Payment Method** (with styled gateway badges)
- **Transaction Status** (`Completed`)
- **Date/Time** (formatted in local time)

---

## ✅ Integrity Verification Dashboard
Allows admins and users to verify whether transaction records were modified.

### Verification Process:
1. Recalculate hash chain recursively from genesis block to current block
2. Compare transaction hashes
3. Validate chain integrity
4. Display verification result

---

## ✅ Donation Tracking Link
Each donation generates a unique public tracking URL.

Example:
```text
/donation/:id
```

---

## ✅ Hash Chain System
Each transaction is linked to the previous transaction using SHA-256 hashing.

### Formula:
```text
hash = SHA256(
  amount +
  display_name +
  timestamp +
  previous_hash
)
```

If one transaction changes:
- All following hashes become invalid
- Tampering becomes immediately detectable

---

# 📂 Project Structure

```text
orpon/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Navbar and Footer
│   │   │   └── ui/           # Custom reusable UI elements
│   │   ├── pages/            # Page templates (CampaignDetail, Donate, etc.)
│   │   ├── utils/            # format.js, api.js
│   │   ├── context/          # AuthContext
│   │   └── App.jsx
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── config/               # Database and blockchain configs
│   ├── controllers/          # Business logic controllers
│   ├── routes/               # API endpoint routing
│   ├── services/             # Helper services (hashing, etc.)
│   ├── middleware/           # Authentication middlewares
│   ├── server.js             # API entrypoint
│   └── package.json
│
└── README.md
```

---

# 🗄️ Database Design

## donations table

| Column | Type | Description |
|---|---|---|
| id | VARCHAR(100) | Unique transaction ID (UUID) |
| donor_name | VARCHAR(255) | Actual donor identity |
| privacy_type | ENUM | Privacy tier (`public`, `anonymous`, `pseudonym`) |
| display_name | VARCHAR(255) | Name shown on public ledger |
| amount | DECIMAL(12,2) | Donation amount in BDT |
| created_at | TIMESTAMP | Creation date/time |
| previous_hash | TEXT | Cryptographic hash of the previous transaction |
| current_hash | TEXT | Cryptographic hash of the current transaction |
| campaign_id | VARCHAR(100) | Link to target campaign |
| payment_method | VARCHAR(50) | Payment gateway used (`bKash`, `Nagad`, `Card`, `Direct`) |
| status | VARCHAR(50) | Execution status (`Completed`) |

---

# 🔐 Security Features

- SHA-256 hashing
- Hash-chain integrity validation
- Tamper detection
- Append-only transaction logic
- Environment variable protection
- Secure payment processing with server-side validation callbacks

---

# 🚀 Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/orpon.git
```

---

## 2️⃣ Backend Setup & Environment Configuration

Create a `.env` file inside the `backend` directory.

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=donation_system

JWT_SECRET=your_secret_key

# Payment Gateways Config
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# bKash Sandbox Keys
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta

# SSLCommerz Sandbox Keys
SSLCOMMERZ_STORE_ID=your_sslcommerz_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sslcommerz_store_password
SSLCOMMERZ_BASE_URL=https://sandbox.sslcommerz.com
```

Start the backend:
```bash
cd backend
npm install
npm run dev
```
*(The backend will automatically detect columns and execute database migrations on start).*

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

# 🔌 API Endpoints

## Donation Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/donate | Create direct/manual donation |
| GET | /api/transactions | Get all public transactions |
| POST | /api/payment/bkash/initiate | Initiate bKash payment session |
| GET | /api/payment/bkash/callback | Verify bKash checkout success/fail |
| POST | /api/payment/card/initiate | Initiate SSLCommerz Card session |
| POST | /api/payment/card/success | Verify SSLCommerz success callback |
| POST | /api/payment/nagad/initiate | Initiate Nagad verification session |
| POST | /api/payment/nagad/callback | Verify simulated Nagad OTP & PIN |

---

# 📚 Academic Purpose

This project was developed for academic and educational purposes to explore:
- Full-stack web development
- Cryptographic integrity systems
- Transparent donation platforms
- Payment gateway sandbox integrations
- Blockchain-ready architecture

---

# 📜 License

This project is open-source and available under the MIT License.

---

# ⭐ Final Note

Orpon combines transparency, privacy, and cryptographic verification to create a modern donation platform that users can trust.

The system demonstrates how traditional web technologies can be enhanced using integrity verification and blockchain-ready architecture to improve accountability in online fundraising systems.