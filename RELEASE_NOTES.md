# Orpon – Release Notes

## v1.0.0 — Initial Public Release
**Date:** June 2025  
**Branch:** `development`

---

### Overview

This is the first public release of **Orpon**, a donation transparency platform built for Bangladeshi communities. The release delivers a complete end-to-end crowdfunding system — from user registration through campaign creation, multi-gateway payment processing, and cryptographic donation verification.

---

### Major Features

#### User Authentication & Account Management
- Secure user registration with unique email, phone, and NID constraints
- JWT-based stateless authentication with bcrypt password hashing
- Full **forgot password / email reset** flow (secure token, 15-minute expiry)
- Branded HTML reset email via SMTP (Nodemailer) with automatic Ethereal.email sandbox fallback for local development

#### Campaign Creation & Management
- Rich campaign creation: title, description, story, category, fundraising goal, duration
- Upload up to **3 campaign images** stored on Cloudinary and delivered via CDN
- GoFundMe-style **image carousel** on campaign detail pages
- Campaign categories: Medical, Education, Disaster Relief, Community
- Owners can view and delete their own campaigns via **My Campaigns**

#### Donation System with Hash-Chain Integrity
- Direct donation recording linked to a specific campaign
- Every donation record stores a **SHA-256 hash chain** (`previous_hash` → `current_hash`), forming a tamper-evident ledger
- Privacy controls: donors may donate anonymously, privately, or publicly
- Public `/api/transactions` ledger endpoint — anyone can audit the donation history

#### Multi-Gateway Payment Integration (Sandbox)
- **bKash** – Bangladesh's #1 MFS gateway (tokenized sandbox API)
- **Nagad** – MFS sandbox with callback-based payment verification
- **SSLCommerz** – Card payment sandbox (VISA/MasterCard) with success, fail, and cancel redirect handlers
- Each gateway has dedicated initiate, callback, and cancel endpoints on the backend

#### Comments
- Authenticated users can post, edit, and delete comments on any campaign
- Public read access for unauthenticated visitors

#### Donor Leaderboard
- Ranked list of top named donors across all campaigns
- Anonymous and private donors are excluded, preserving privacy preferences

#### Campaign Owner Analytics
- Per-campaign stats (total raised, donor count, progress percentage)
- Available to campaign creators from the **My Campaigns → Analytics** view

#### Admin Dashboard
- Platform-wide aggregate statistics (total raised, campaigns, users, donations)
- Full tables: all campaigns, all donations, all registered users
- **Hash-chain integrity checker**: re-computes the full hash chain in real time and flags any broken links
- Promote any user to admin role from the dashboard
- System activity log

#### Blockchain Anchoring (Polygon Amoy Testnet)
- Batched donation hash anchoring to a custom **Solidity smart contract** on Polygon Amoy
- Public `/api/anchors/history` endpoint exposes all on-chain anchor records
- Admin-triggered **manual anchoring** from the dashboard
- Gracefully disabled when blockchain credentials are absent (zero downtime fallback)

---

### Improvements & Refinements

#### Security
- **Helmet.js** security headers applied globally (HSTS, CSP, X-Frame-Options, etc.)
- Strict **CORS allowlist**: only `orpon.me`, `www.orpon.me`, and explicitly configured origins accepted
- Auth endpoints protected by **rate limiting** to prevent brute-force and credential stuffing
- Admin routes double-guarded by both JWT (`authMiddleware`) and role check (`adminMiddleware`)
- Fixed: admin route guards that previously allowed non-admin authenticated users to access admin endpoints
- Fixed: rate-limiter memory leak for long-running server processes

#### Performance
- Lazy-loading of `ethers.js` — only initialised if blockchain credentials are present (eliminates ~200 ms startup overhead when not configured)
- Consolidated DB schema queries on startup to a single batch instead of sequential calls
- Cloudinary env vars made **optional**: server starts successfully even without cloud image config

#### UI/UX
- Increased campaign card image height from 140 px to 180 px for better visual aspect ratio
- Persistent image display on campaign cards after reload (normalizeCampaign mapping fix)
- Smooth scroll-to-top on route change
- Unified cream (`#F8F6F0`) background design language across all pages
- **Plus Jakarta Sans** typography applied consistently throughout the app
- Login modal trust highlights streamlined to a single-line layout

#### DevOps
- GitHub Actions CI/CD pipelines for both frontend (Azure Static Web Apps) and backend (Azure App Service)
- Node.js v20 deprecation warning resolved in deployment workflow
- Automatic `VITE_API_URL` injection at build time — no manual frontend config changes needed for production deploys
- Deployment packaged as a clean `deploy.zip` (excludes `node_modules`, `.env`, and git files)

#### CORS & Domain
- `orpon.me` and `www.orpon.me` added to the CORS allowlist to support the custom domain without reconfiguration

---

### Payment Integration Status

| Gateway | Status | Environment |
|---|---|---|
| bKash | ✅ Integrated | Sandbox only |
| Nagad | ✅ Integrated | Sandbox only |
| SSLCommerz (Card) | ✅ Integrated | Sandbox only |
| Live / Production payments | ⚠️ Not yet activated | Requires merchant account approval |

> **Note:** All three payment gateways are fully wired end-to-end (initiate → callback → record) but operate in **sandbox mode**. Switching to production requires updating the gateway credentials and base URLs in the App Service configuration.

---

### Known Limitations

1. **Payments are sandbox-only.** Live transactions are not processed until merchant accounts are approved and production credentials are configured.
2. **Blockchain anchoring requires external credentials.** The Polygon Amoy testnet anchoring feature is disabled if `POLYGON_RPC_URL`, `WALLET_PRIVATE_KEY`, and `CONTRACT_ADDRESS` are not set.
3. **No real-time updates.** The donation feed and campaign progress do not auto-refresh without a page reload (WebSocket/SSE not yet implemented).
4. **Single-branch CI/CD.** The automated deployment pipeline is triggered only by pushes to the `development` branch. A `main`/production branch promotion workflow is not yet in place.
5. **No email verification on registration.** Users can register with any email address without verifying ownership.
6. **Admin promotion is manual.** There is no self-service admin application; an existing admin must use the dashboard to grant the role.
7. **Redis is optional with in-memory fallback.** In multi-instance deployments, the in-memory fallback does not share state across instances.

---

### Future Plans

- [ ] Activate production payment gateways (bKash, Nagad, SSLCommerz live accounts)
- [ ] Email verification on registration
- [ ] Campaign update posts (organizers can post milestone updates to their campaigns)
- [ ] Real-time donation feed via WebSocket or Server-Sent Events
- [ ] Campaign search and advanced filtering on the Explore page
- [ ] Social sharing (campaign-specific Open Graph meta tags)
- [ ] Mobile-first responsive redesign / PWA support
- [ ] Production Polygon mainnet anchoring (or alternative L2)
- [ ] Downloadable donation receipts (PDF)
- [ ] Refund / dispute management for admins
- [ ] Multi-language support (English + Bangla)
- [ ] `main` branch promotion workflow with staging gate

---

*For questions, bug reports, or contributions, open an issue or pull request on the project repository.*
