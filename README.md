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
- Anonymous donations
- Transaction verification
- Hash-chain integrity system
- Blockchain-ready architecture

---

# 🎯 Project Objectives

- Build a transparent donation platform
- Prevent hidden modification of donation records
- Provide public visibility of transactions
- Allow secure and anonymous donations
- Create a scalable blockchain-ready architecture

---

# 🏗️ System Architecture

```text
Frontend (React + Vite)
        ↓
Backend API (Node.js + Express)
        ↓
MySQL Database
        ↓
SHA-256 Hash Chain
        ↓
Blockchain Anchoring (Future Implementation)
```

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React
- QRCode React

## Backend
- Node.js
- Express.js

## Database
- MySQL

## Security & Integrity
- SHA-256 Hashing
- Hash Chain Verification

## Payment Gateway
- bKash
- Nagad
- Card Payment Gateway

## Future Blockchain Integration
- Polygon Testnet (Planned)
- ethers.js (Planned)

---

# 👥 User Roles

## 👤 Donor/User
Users who make donations and verify transparency.

### Features:
- Make donations
- Donate anonymously
- View public ledger
- Verify transaction integrity
- Access donation tracking links

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
Users can donate while hiding their identity.

### Privacy Options:
- Public Name
- Anonymous
- Pseudonym

---

## ✅ Public Transaction Ledger
A publicly accessible ledger displaying:
- Donation amount
- Timestamp
- Transaction hash
- Verification status

---

## ✅ Integrity Verification Dashboard
Allows admins and users to verify whether transaction records were modified.

### Verification Process:
1. Recalculate hash chain
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

### Example:
```text
hash = SHA256(
  amount +
  donor +
  timestamp +
  previous_hash
)
```

If one transaction changes:
- All following hashes become invalid
- Tampering becomes detectable

---

## ✅ Batch Anchoring (Planned)
The system is designed for future blockchain integration.

### Planned Workflow:
- Group transactions into batches
- Store final batch hash on blockchain
- Enable immutable verification

---

# 📂 Project Structure

```text
orpon/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── context/
│   │   └── utils/
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── database/
│   └── app.js
│
└── README.md
```

---

# 🗄️ Database Design

## transactions table

| Column | Description |
|---|---|
| id | Unique transaction ID |
| amount | Donation amount |
| donor_name | Donor identity |
| is_anonymous | Privacy status |
| previous_hash | Previous transaction hash |
| current_hash | Current transaction hash |
| created_at | Timestamp |

---

# 🔐 Security Features

- SHA-256 hashing
- Hash-chain integrity validation
- Tamper detection
- Append-only transaction logic
- Environment variable protection
- Secure payment processing

---

# 🌍 Public Transparency System

Orpon emphasizes public accountability by:
- exposing transaction history
- enabling verification
- providing transparent donation tracking

This increases donor trust and organizational credibility.

---

# 💳 Payment Integration

## Supported Payment Methods
- bKash
- Nagad
- Card Payment

### Current Status
Sandbox/testing integration planned.

---

# 🚀 Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/orpon.git
```

---

## 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 3️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## 4️⃣ Configure Environment Variables

Create `.env` file inside backend directory.

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=orpon

JWT_SECRET=your_secret_key
```

---

# 🔌 API Endpoints

## Donation Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/donate | Create donation |
| GET | /api/transactions | Get all transactions |
| GET | /api/transaction/:id | Get single transaction |
| GET | /api/verify | Verify hash chain |

---

# 🧪 Verification Workflow

```text
1. User makes donation
2. System generates hash
3. Hash linked to previous transaction
4. Data stored in MySQL
5. Verification recalculates hashes
6. System returns VALID or INVALID
```

---

# 📊 Future Improvements

## Planned Features
- Full blockchain anchoring
- Smart contract integration
- Real-time analytics
- Multi-language support
- Mobile application
- AI fraud detection
- QR donation verification

---

# ☁️ Deployment

## Planned Hosting
- Azure Cloud

Possible deployment:
- Frontend → Azure Static Web Apps
- Backend → Azure App Service
- Database → Azure MySQL

---

# 📚 Academic Purpose

This project was developed for academic and educational purposes to explore:
- Full-stack web development
- Cryptographic integrity systems
- Transparent donation platforms
- Blockchain-ready architecture

---

# 🤝 Contribution

Contributions, ideas, and improvements are welcome.

### Steps:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Open pull request

---

# 📜 License

This project is open-source and available under the MIT License.

---

# 👨‍💻 Authors

Developed by Team Orpon

---

# ⭐ Final Note

Orpon combines transparency, privacy, and cryptographic verification to create a modern donation platform that users can trust.

The system demonstrates how traditional web technologies can be enhanced using integrity verification and blockchain-ready architecture to improve accountability in online fundraising systems.