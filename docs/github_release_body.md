Orpon is a donation transparency platform for Bangladeshi communities — combining local payment gateways (bKash, Nagad, SSLCommerz) with a cryptographic hash-chain ledger and optional Polygon blockchain anchoring.

## ✨ What's in v1.0.0

### Core Features
- **User authentication** – JWT + bcrypt, rate-limited auth, forgot-password email flow
- **Campaign creation** – rich form with up to 3 Cloudinary-hosted images, GoFundMe-style carousel
- **Donation recording** – SHA-256 hash-chain ledger; every donation is cryptographically linked to the previous one
- **Payment gateways (sandbox)** – bKash, Nagad, and SSLCommerz card payments fully wired end-to-end
- **Comments** – authenticated post/edit/delete on any campaign; public read
- **Donor leaderboard** – ranked named donors; anonymous/private donors excluded
- **Campaign analytics** – per-campaign stats for campaign owners
- **Admin dashboard** – platform stats, full data tables, real-time hash-chain integrity verifier, user role management
- **Blockchain anchoring** – batch hashes anchored to Polygon Amoy testnet via Solidity smart contract

### Security & Stability
- Helmet.js HTTP security headers globally applied
- Strict CORS allowlist (orpon.me, www.orpon.me)
- Admin routes double-guarded (JWT + role check)
- Fixed rate-limiter memory leak on long-running servers
- Lazy-loaded ethers.js for faster startup when blockchain is unconfigured

### Deployment
- Frontend: Azure Static Web Apps → **[orpon.me](https://orpon.me)**
- Backend: Azure App Service (`orpon-backend-api-sea`)
- CI/CD: GitHub Actions (auto-deploy on push to `development`)

## ⚠️ Known Limitations
- Payments are **sandbox only** — live transactions not yet active
- No email verification on registration
- No real-time donation feed (page reload required)

## 🔭 What's Next
- Production payment gateway activation
- Email verification on signup
- Campaign update posts
- Real-time donation feed (WebSocket/SSE)
- Downloadable donation receipts

---
Full changelog: [RELEASE_NOTES.md](https://github.com/shezanyo/Orpon/blob/main/RELEASE_NOTES.md)  
Project background: [ABOUT.md](https://github.com/shezanyo/Orpon/blob/main/ABOUT.md)
