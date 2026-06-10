# About Orpon

## What Is Orpon?

**Orpon** (অর্পণ) means *offering* or *dedication* in Bengali — a name chosen to reflect the spirit of giving back to one's community.

Orpon is an online crowdfunding and donation platform built specifically for Bangladeshi users. It enables individuals to create fundraising campaigns for causes that matter to them — a neighbour's medical emergency, flood relief in a remote village, a rural school's infrastructure, or a community development project — and collect donations through the payment methods that Bangladeshis already use and trust: **bKash, Nagad, and card payments via SSLCommerz**.

---

## The Problem

Trust is the single biggest obstacle to online giving in Bangladesh. Stories of misused donation funds circulate frequently, and donors — whether giving BDT 100 or BDT 100,000 — have no reliable way to verify that:

1. The campaign story is genuine
2. Their donation was actually recorded
3. The donation record has not been altered after the fact

Traditional crowdfunding platforms solve none of these problems for local users, and most are not designed for the Bangladeshi payment ecosystem at all.

---

## Our Mission

> **To make every taka donated traceable, verifiable, and accountable — for donors, organizers, and the public.**

Orpon's mission is to rebuild trust in community giving through technology. We believe that transparency is not a nice-to-have feature; it is the foundation that makes online charitable giving viable in Bangladesh.

---

## How We Deliver on Transparency

### Cryptographic Hash Chain

Every donation recorded on Orpon is linked to the one before it using a **SHA-256 hash chain** — the same technique used in blockchain ledgers. Each donation record stores a hash of its own data combined with the hash of the previous donation. If anyone tampers with even a single past record, every subsequent hash in the chain becomes invalid and the tampering is immediately detectable.

Any user — technical or not — can view the public ledger at `/api/transactions` and verify the integrity of the chain.

### Blockchain Anchoring

For an additional layer of external verifiability, Orpon anchors batch hashes of the donation ledger to the **Polygon Amoy** blockchain — a public, permissionless network that no single party controls. These anchor records are permanently stored on-chain and publicly accessible, providing cryptographic proof that the donation history existed in a specific state at a specific point in time.

### Admin Integrity Dashboard

Platform administrators have access to a real-time **hash-chain integrity verifier** that re-computes the entire ledger and flags any broken links. This is an internal safeguard that supplements the public audit capability.

### Privacy-Respecting Transparency

Transparency does not require sacrificing privacy. Donors on Orpon choose their own visibility:

- **Public** — name and amount shown in the public ledger and leaderboard
- **Private** — donation is recorded and counted but the name is not displayed
- **Anonymous** — donation is recorded but no identifying information is stored

Regardless of privacy setting, the *cryptographic integrity* of every donation is always maintained.

---

## Goals

### Short-Term
- Provide a reliable, user-friendly crowdfunding tool for Bangladeshi communities
- Offer a verifiable, tamper-evident donation ledger that any donor can audit
- Integrate with bKash, Nagad, and card payments for frictionless local giving
- Support both urban and semi-urban users through a clean, accessible interface

### Medium-Term
- Activate production-level payment gateways to process real donations
- Introduce campaign verification badges for trusted organizers and NGOs
- Add campaign update posts so organizers can keep donors informed about how funds are used
- Offer downloadable donation receipts for tax and record-keeping purposes

### Long-Term
- Anchor the ledger to a public blockchain mainnet (Polygon or similar) for permanent, immutable record-keeping
- Expand to support organisational accounts (NGOs, community groups) with multi-admin capabilities
- Publish a public impact dashboard showing aggregated statistics on how donations have been used
- Explore partnerships with local financial institutions and government social welfare programmes

---

## Academic & Project Context

Orpon was developed as an academic software engineering project. It demonstrates end-to-end full-stack development across the following domains:

- **Full-stack web development** — React + Node.js/Express
- **Relational database design** — Azure SQL with normalised schema
- **Cloud deployment** — Azure Static Web Apps + Azure App Service with GitHub Actions CI/CD
- **Security engineering** — JWT auth, rate limiting, Helmet security headers, bcrypt hashing
- **Payment gateway integration** — bKash tokenized API, Nagad sandbox, SSLCommerz
- **Applied cryptography** — SHA-256 hash chains for ledger integrity
- **Blockchain integration** — ethers.js + Solidity smart contract on Polygon Amoy testnet
- **Image CDN** — Cloudinary for campaign media

The project was designed to reflect production-quality engineering practices, including:
- Environment variable management and secrets hygiene
- Automated CI/CD pipelines
- CORS policy enforcement
- Input validation and error handling
- Graceful degradation (optional services like blockchain and Redis disable cleanly when unconfigured)

---

## Team

Orpon was built by a collaborative student team. See the [README contributors section](README.md#contributors) for the full list of contributors ranked by commit count.

---

## Contact & Links

| Channel | Link |
|---|---|
| Live Platform | [https://orpon.me](https://orpon.me) |
| Frontend (Azure) | [thankful-sea-0f5fbd000.7.azurestaticapps.net](https://thankful-sea-0f5fbd000.7.azurestaticapps.net) |
| Backend API | [orpon-backend-api-sea.azurewebsites.net/api/health](https://orpon-backend-api-sea.azurewebsites.net/api/health) |

---

*Orpon — Because every act of giving deserves to be remembered, and every taka deserves to be trusted.*
