# 🚀 Orpon – First-Time Azure Deployment Guide (Sandbox Payments)

> **For:** Shezan · Azure Student Account · Bangladesh region
> **Branch strategy:** Deploy from a new `experimental-deploy` branch
> **Payments:** Sandbox mode (bKash sandbox, SSLCommerz sandbox, Nagad simulated)

---

## Table of Contents

1. [⚠️ Safety First – Protect Your Secrets](#1-safety-first--protect-your-secrets)
2. [🌿 Create the Experimental Branch](#2-create-the-experimental-branch)
3. [🔧 Code Changes Needed Before Deploying](#3-code-changes-needed-before-deploying)
4. [☁️ Azure Setup – Create Resources](#4-azure-setup--create-resources)
5. [🗄️ Set Up the Azure SQL Database](#5-set-up-the-azure-sql-database)
6. [🖥️ Deploy Backend to Azure App Service](#6-deploy-backend-to-azure-app-service)
7. [🌐 Deploy Frontend to Azure Static Web Apps](#7-deploy-frontend-to-azure-static-web-apps)
8. [✅ Verify Everything Works](#8-verify-everything-works)
9. [🔄 How to Update Code After Deployment](#9-how-to-update-code-after-deployment)
10. [💰 Cost Management – Stay Free](#10-cost-management--stay-free)
11. [🔧 Troubleshooting](#11-troubleshooting)
12. [📋 Post-Deployment Audit & Environment Fixes (June 2026)](#12-post-deployment-audit--environment-fixes-june-2026)

---

## 1. Safety First – Protect Your Secrets

> [!CAUTION]
> Your `backend/.env` file contains **real sandbox API keys** and is **NOT** in `.gitignore`.
> If you push to GitHub without fixing this, your keys will be **publicly visible**.

### Step 1.1 – Create a root `.gitignore`

Create a file at the project root: `/home/shezan/Projects/Orpon/.gitignore`

```gitignore
# Environment files (NEVER commit these)
.env
.env.*
!.env.example

# Dependencies
node_modules/

# Build output
dist/
build/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

### Step 1.2 – Remove `.env` from Git tracking (if it was previously committed)

```bash
cd ~/Projects/Orpon
git rm --cached backend/.env    # removes from Git but keeps the file locally
git commit -m "chore: remove .env from tracking"
```

### Step 1.3 – Create a safe `.env.example`

Create `backend/.env.example` (this IS safe to commit – it has no real values):

```dotenv
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Azure SQL / MSSQL
DB_HOST=localhost
DB_PORT=1433
DB_USER=your_sql_user
DB_PASSWORD=your_password
DB_NAME=donation_system
DB_TRUST_CERT=true # use false for Azure SQL

# Redis (optional – app falls back to in-memory if not set)
USE_REDIS=false
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=change_me_to_a_random_string

# bKash Sandbox
BKASH_USERNAME=your_bkash_sandbox_username
BKASH_PASSWORD=your_bkash_sandbox_password
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta

# SSLCommerz Sandbox
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_BASE_URL=https://sandbox.sslcommerz.com
```

---

## 2. Create the Experimental Branch

```bash
cd ~/Projects/Orpon

# Make sure you're on your current branch and everything is clean
git status

# Create and switch to the experimental branch
git checkout -b experimental-deploy

# Push the new branch to GitHub
git push -u origin experimental-deploy
```

From this point, **all deployment changes happen on `experimental-deploy`**. Your `main` and other branches stay untouched.

---

## 3. Code Changes Needed Before Deploying

### 3.1 – Make the frontend API URL dynamic

Currently `frontend/src/utils/api.js` has a **hardcoded** `localhost` URL. We need it to read from an environment variable so it works on Azure.

**Change line 1 of** `frontend/src/utils/api.js`:

```diff
- export const API_URL = "http://localhost:5000/api";
+ export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

> **How it works:** In development it falls back to `localhost`. On Azure, you'll set `VITE_API_URL` at build time.

### 3.2 – Make the backend port dynamic

**Change the last 3 lines of** `backend/server.js`:

```diff
- app.listen(5000, () => {
-     console.log("Server running on port 5000");
- });
+ const PORT = process.env.PORT || 5000;
+ app.listen(PORT, () => {
+     console.log(`Server running on port ${PORT}`);
+ });
```

> **Why:** Azure App Service assigns the port dynamically via the `PORT` environment variable. Without this, the app won't start on Azure.

### 3.3 – Commit the changes

```bash
git add -A
git commit -m "feat: prepare for Azure deployment (dynamic URLs, gitignore)"
git push origin experimental-deploy
```

---

## 4. Azure Setup – Create Resources

### 4.1 – Log in to Azure Portal

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your **student** Microsoft account
3. Verify your subscription: search **"Subscriptions"** in the top bar → you should see **Azure for Students**

### 4.2 – Install Azure CLI (if not already installed)

```bash
# On Ubuntu/Debian
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Verify installation
az --version

# Login from terminal
az login
```

### 4.3 – Create a Resource Group

Think of a Resource Group as a folder that holds all your Azure resources together.

```bash
az group create \
  --name OrponRG \
  --location southeastasia
```

> **Why `southeastasia`?** It's the closest Azure region to Bangladesh (Singapore). This gives you the lowest latency.

---

## 5. Set Up the Azure SQL Database

### 5.1 – Create Azure SQL logical server

```bash
az sql server create \
  --resource-group OrponRG \
  --name orpon-sql-server \
  --location southeastasia \
  --admin-user orponadmin \
  --admin-password 'YourStrongPassword123!'
```

> [!IMPORTANT]
> - Replace `YourStrongPassword123!` with your own strong password (must include uppercase, lowercase, number, and special character).
> - Azure SQL uses port `1433` by default.
> - Use `orpon-sql-server.database.windows.net` as the DB host.

### 5.2 – Configure server firewall

```bash
az sql server firewall-rule create \
  --resource-group OrponRG \
  --server orpon-sql-server \
  --name AllowAzureIps \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

> This allows Azure services to connect to the database. For local CLI access, add your current IP instead of `0.0.0.0`.

### 5.3 – Create the database

```bash
az sql db create \
  --resource-group OrponRG \
  --server orpon-sql-server \
  --name donation_system \
  --edition Free
```

### 5.4 – Create the tables

Connect using Azure Data Studio, SQL Server Management Studio, or `sqlcmd`:

```bash
sqlcmd -S orpon-sql-server.database.windows.net -U orponadmin -P 'YourStrongPassword123!' -d donation_system
```

Once connected, run the full schema below to create the base tables required by the backend.

```sql
CREATE TABLE IF NOT EXISTS users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    full_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NULL UNIQUE,
    nid NVARCHAR(20) NULL UNIQUE,
    address NVARCHAR(MAX) NULL
);

CREATE TABLE IF NOT EXISTS campaigns (
    id NVARCHAR(36) PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    story NVARCHAR(MAX) NULL,
    category NVARCHAR(100) NOT NULL,
    target_amount DECIMAL(18,2) NOT NULL,
    raised_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    donor_count INT NOT NULL DEFAULT 0,
    days_left INT NOT NULL DEFAULT 30,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    organizer_name NVARCHAR(255) NOT NULL,
    is_verified BIT NOT NULL DEFAULT 0,
    color NVARCHAR(50) NULL,
    emoji NVARCHAR(50) NULL,
    CONSTRAINT FK_Campaigns_Users FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS donations (
    id NVARCHAR(36) PRIMARY KEY,
    donor_name NVARCHAR(255) NULL,
    privacy_type NVARCHAR(20) NOT NULL,
    display_name NVARCHAR(255) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    created_at DATETIME2 NOT NULL,
    previous_hash NVARCHAR(255) NOT NULL,
    current_hash NVARCHAR(255) NOT NULL,
    campaign_id NVARCHAR(36) NOT NULL,
    payment_method NVARCHAR(50) NOT NULL DEFAULT 'Direct',
    status NVARCHAR(50) NOT NULL DEFAULT 'Completed',
    CONSTRAINT FK_Donations_Campaigns FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);
```

> Note: The backend registration flow inserts into `users` without specifying an `id`, so the `users.id` column must be auto-generated. The `UNIQUEIDENTIFIER DEFAULT NEWID()` definition above provides that behavior.

If you already have a local SQL Server schema file, you can run it directly in Azure Data Studio or with `sqlcmd`:

```bash
sqlcmd -S orpon-sql-server.database.windows.net -U orponadmin -P 'YourStrongPassword123!' -d donation_system -i /path/to/your/schema.sql
```

### 5.4.1 – Validate the schema

After creating the tables, verify them with:

```sql
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('users', 'campaigns', 'donations')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
```

If the tables already exist and are missing the optional fields used by the current backend, the app will add them automatically on startup via `backend/config/db.js`:
- `users.phone`
- `users.nid`
- `users.address`
- `donations.payment_method`
- `donations.status`

If you prefer a faster setup, paste the full SQL block above into Azure Data Studio or SSMS and execute it in the `donation_system` database.

---

## 6. Deploy Backend to Azure App Service

### 6.1 – Create an App Service Plan + Web App

```bash
# Create plan (F1 = Free tier for Azure for Students)
# NOTE: the Free tier may have limits (CPU/minutes/day). If your subscription
# doesn't allow Linux Free plans, omit --is-linux to create a Windows F1 plan.
az appservice plan create \
  --name OrponPlan \
  --resource-group OrponRG \
  --sku F1 \
  --is-linux

# Create the web app (Node 24 LTS recommended)
# Azure supports `NODE|24-lts` and `NODE|22-lts`; use `NODE|24-lts` unless you need 22.
az webapp create \
  --resource-group OrponRG \
  --plan OrponPlan \
  --name orpon-backend-api \
  --runtime "NODE|24-lts"
```

> [!NOTE]
> The name `orpon-backend-api` must be **globally unique** across all of Azure. If it's taken, try something like `orpon-backend-shezan`.
> Your app will be available at: `https://orpon-backend-api.azurewebsites.net`

### 6.2 – Set the startup command

Azure needs to know how to start your backend:

```bash
az webapp config set \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --startup-file "node server.js"
```

### 6.3 – Set environment variables (Application Settings)

This is how you provide your `.env` values **without** committing them:

```bash
az webapp config appsettings set \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --settings \
    PORT=8080 \
    BACKEND_URL=https://orpon-backend-api.azurewebsites.net \
    FRONTEND_URL=https://your-frontend-url.azurestaticapps.net \
    DB_HOST=orpon-sql-server.database.windows.net \
    DB_PORT=1433 \
    DB_USER=orponadmin \
    DB_PASSWORD='YourStrongPassword123!' \
    DB_NAME=donation_system \
    DB_TRUST_CERT=false \
    JWT_SECRET='a-very-long-random-secret-string-change-this' \
    USE_REDIS=false \
    BKASH_USERNAME=sandboxTokenizedUser02 \
    BKASH_PASSWORD='sandboxTokenizedUser02@12345' \
    BKASH_APP_KEY=4f6o0cjiki2rfm34kfdadl1eqq \
    BKASH_APP_SECRET=2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b \
    BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta \
    SSLCOMMERZ_STORE_ID=testbox \
    SSLCOMMERZ_STORE_PASSWORD=qwerty \
    SSLCOMMERZ_BASE_URL=https://sandbox.sslcommerz.com
```

> - You'll update `FRONTEND_URL` after deploying the frontend in step 7.

### 6.4 – Deploy the backend code

**Option A: Deploy from GitHub (Recommended – easiest to update later)**

```bash
az webapp deployment source config \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --repo-url https://github.com/shezanyo/Orpon.git \
  --branch experimental-deploy \
  --manual-integration
```

> **What this does:** Azure pulls the code from your `experimental-deploy` branch.
> You'll need to tell Azure the backend is in a subfolder:

```bash
az webapp config appsettings set \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --settings PROJECT=backend
```

**Option B: Deploy via ZIP (if GitHub method has issues)**

```bash
cd ~/Projects/Orpon/backend
zip -r ../backend.zip . -x "node_modules/*" ".env"

az webapp deployment source config-zip \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --src ../backend.zip
```

### 6.5 – Check the logs

```bash
# Stream live logs
az webapp log tail \
  --resource-group OrponRG \
  --name orpon-backend-api
```

You should see:
```
Server running on port 8080
Database migrations checked & completed successfully!
Redis not enabled. Operating in local memory fallback Map mode.
```

---

## 7. Deploy Frontend to Azure Static Web Apps

Azure Static Web Apps is **free** and perfect for a React/Vite SPA.

### 7.1 – Build the frontend locally first (to test)

```bash
cd ~/Projects/Orpon/frontend

# Set the backend URL for the build
VITE_API_URL=https://orpon-backend-api.azurewebsites.net/api npm run build
```

This creates a `dist/` folder with the compiled static files.

### 7.2 – Create a Static Web App via Azure Portal (easiest way)

1. Go to [Azure Portal](https://portal.azure.com)
2. Search **"Static Web Apps"** → Click **+ Create**
3. Fill in:
   - **Subscription:** Azure for Students
   - **Resource Group:** OrponRG
   - **Name:** `orpon-frontend`
   - **Region:** Southeast Asia (closest to Bangladesh)
   - **Source:** GitHub
   - **Organization:** shezanyo
   - **Repository:** Orpon
   - **Branch:** `experimental-deploy`
4. **Build Details:**
   - **Build Preset:** React
   - **App location:** `/frontend`
   - **Output location:** `dist`
5. Click **Review + Create** → **Create**

> [!NOTE]
> Azure will automatically create a GitHub Actions workflow file in your repo. Every time you push to `experimental-deploy`, the frontend will rebuild and redeploy automatically! 🎉

### 7.3 – Set the backend URL as an environment variable

In Azure Portal → **orpon-frontend** Static Web App → **Configuration** → **Application settings**:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://orpon-backend-api.azurewebsites.net/api` |

### 7.4 – Update the backend's FRONTEND_URL

Now that you know the frontend URL (e.g., `https://blue-sand-xxxxxxxx.southeastasia.5.azurestaticapps.net`):

```bash
az webapp config appsettings set \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --settings FRONTEND_URL=https://blue-sand-xxxxxxxx.southeastasia.5.azurestaticapps.net
```

This ensures payment callbacks redirect to the correct frontend domain.

---

## 8. Verify Everything Works

### ✅ Checklist

| Test | How | Expected Result |
|------|-----|-----------------|
| Backend is alive | Visit `https://orpon-backend-api.azurewebsites.net/api/campaigns` | JSON response (empty array or campaign data) |
| Frontend loads | Visit your Static Web App URL | The Orpon UI appears |
| User registration | Register a new user on the frontend | Success message, user stored in Azure SQL |
| Create campaign | Create a test campaign | Campaign appears in the list |
| bKash sandbox payment | Click donate → bKash → complete sandbox flow | Redirected to bKash sandbox checkout, then back to your success page |
| SSLCommerz sandbox | Click donate → Card → complete sandbox flow | Redirected to SSLCommerz sandbox, then back to success |
| Transaction appears in DB | Check the `donations` table in Azure SQL | Row with status `Completed` and blockchain hash |

### Quick DB check from terminal

```bash
sqlcmd -S orpon-sql-server.database.windows.net -U orponadmin -P 'YourStrongPassword123!' -d donation_system -Q "SELECT TOP 5 id, donor_name, amount, status, payment_method FROM donations ORDER BY id DESC;"
```

---

## 9. How to Update Code After Deployment

### Frontend (automatic via GitHub Actions)

```bash
# 1. Make your changes locally
cd ~/Projects/Orpon/frontend
# ... edit files ...

# 2. Commit and push to the experimental branch
git add -A
git commit -m "fix: updated donation form styling"
git push origin experimental-deploy

# 3. Done! Azure Static Web Apps will automatically:
#    - Detect the push
#    - Rebuild the frontend
#    - Deploy it
#    Check progress in GitHub → Actions tab
```

### Backend (manual sync or redeploy)

**If you used GitHub deployment (Option A in step 6.4):**

```bash
# 1. Make your changes
cd ~/Projects/Orpon/backend
# ... edit files ...

# 2. Commit and push
git add -A
git commit -m "fix: improved error handling in paymentController"
git push origin experimental-deploy

# 3. Tell Azure to re-pull the latest code
az webapp deployment source sync \
  --resource-group OrponRG \
  --name orpon-backend-api
```

**If you used ZIP deployment (Option B):**

```bash
# 1. Make changes, then re-zip and redeploy
cd ~/Projects/Orpon/backend
zip -r ../backend.zip . -x "node_modules/*" ".env"

az webapp deployment source config-zip \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --src ../backend.zip
```

### Updating environment variables

```bash
# Change any setting at any time (app restarts automatically)
az webapp config appsettings set \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --settings SOME_KEY=new_value
```

### When you're ready to remove sandbox payments later

Simply update the environment variables to production values:

```bash
az webapp config appsettings set \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --settings \
    BKASH_BASE_URL=https://tokenized.pay.bka.sh/v1.2.0-beta \
    BKASH_USERNAME=your_production_username \
    BKASH_PASSWORD=your_production_password \
    BKASH_APP_KEY=your_production_app_key \
    BKASH_APP_SECRET=your_production_app_secret \
    SSLCOMMERZ_BASE_URL=https://securepay.sslcommerz.com \
    SSLCOMMERZ_STORE_ID=your_production_store_id \
    SSLCOMMERZ_STORE_PASSWORD=your_production_store_password
```

No code changes needed – the controller already reads everything from environment variables.

---

## 10. Cost Management – Stay Free

Azure for Students gives you **$100 in credits** (valid for 12 months). Here's what Orpon costs:

| Resource | SKU | Monthly Cost |
|----------|-----|--------------|
| App Service (backend) | F1 (Free) | $0 (limited quota) |
| Azure SQL Database | Basic | ~$5 (from credits) |
| Static Web App (frontend) | Free tier | **$0** |
| Redis | *Not used (in-memory fallback)* | **$0** |
| **Total** | | **~$18/month from credits** |

> [!TIP]
> Your $100 lasts approximately **5 months** with this setup. When credits are running low, you can:
> - Switch the App Service to **F1 (Free)** tier (limited to 60 min CPU/day)
> - Delete the Azure SQL resources when not using them: `az group delete --name OrponRG --yes`

---

## 11. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| **Backend shows "Application Error"** | App crashed on startup | Run `az webapp log tail --resource-group OrponRG --name orpon-backend-api` and look for the error |
| **Cannot connect to Azure SQL** | Firewall blocking | Go to Azure Portal → SQL server → Networking → check **"Allow public access from any Azure service"** is ON |
| **`ECONNREFUSED` in logs** | Wrong `DB_HOST` value | Verify the host is `orpon-sql-server.database.windows.net` (the full FQDN, not just the server name) |
| **Frontend shows blank page** | `VITE_API_URL` not set at build time | Rebuild with the env var: `VITE_API_URL=https://... npm run build` |
| **CORS error in browser console** | Backend doesn't allow frontend origin | The current `server.js` uses `cors()` which allows everything – should work. If issues persist, check the `FRONTEND_URL` setting |
| **bKash sandbox returns 401** | Sandbox credentials expired or wrong | Verify credentials at [bKash sandbox portal](https://developer.bka.sh/) |
| **Payment callback goes to `localhost`** | `BACKEND_URL` still set to localhost | Update: `az webapp config appsettings set ... --settings BACKEND_URL=https://orpon-backend-api.azurewebsites.net` |
| **Static Web App build fails** | GitHub Actions workflow wrong | Check the `.github/workflows/` YAML – ensure `app_location: "/frontend"` and `output_location: "dist"` |
| **SQL connection drops after idle** | Connection pool timeout | The `waitForConnections: true` in `db.js` handles this, but you can add `enableKeepAlive: true` to the pool config |

---

## Quick Reference – All Commands in Order

```bash
# === ONE-TIME SETUP ===

# 1. Fix gitignore & create branch
cd ~/Projects/Orpon
git rm --cached backend/.env
# (create .gitignore and .env.example as described above)
git checkout -b experimental-deploy
git add -A
git commit -m "feat: prepare for Azure deployment"
git push -u origin experimental-deploy

# 2. Azure resources
az login
az group create --name OrponRG --location southeastasia
az sql server create --resource-group OrponRG --name orpon-sql-server --location southeastasia --admin-user orponadmin --admin-password 'YourStrongPassword123!'
az sql db create --resource-group OrponRG --server orpon-sql-server --name donation_system --service-objective Basic
az appservice plan create --name OrponPlan --resource-group OrponRG --sku F1 --is-linux
az webapp create --resource-group OrponRG --plan OrponPlan --name orpon-backend-api --runtime "NODE|24-lts"

# 3. Deploy backend
az webapp config set --resource-group OrponRG --name orpon-backend-api --startup-file "node server.js"
az webapp config appsettings set --resource-group OrponRG --name orpon-backend-api --settings PORT=8080 DB_HOST=orpon-sql-server.database.windows.net DB_PORT=1433 DB_USER=orponadmin DB_PASSWORD='YourStrongPassword123!' DB_NAME=donation_system DB_TRUST_CERT=false BACKEND_URL=https://orpon-backend-api.azurewebsites.net FRONTEND_URL=https://your-frontend-url JWT_SECRET=change-this USE_REDIS=false BKASH_USERNAME=sandboxTokenizedUser02 BKASH_PASSWORD='YourStrongPassword02@12345' BKASH_APP_KEY=4f6o0cjiki2rfm34kfdadl1eqq BKASH_APP_SECRET=2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta SSLCOMMERZ_STORE_ID=testbox SSLCOMMERZ_STORE_PASSWORD=qwerty SSLCOMMERZ_BASE_URL=https://sandbox.sslcommerz.com
az webapp deployment source config --resource-group OrponRG --name orpon-backend-api --repo-url https://github.com/shezanyo/Orpon.git --branch experimental-deploy --manual-integration
az webapp config appsettings set --resource-group OrponRG --name orpon-backend-api --settings PROJECT=backend

# 4. Deploy frontend via Azure Portal → Static Web Apps (GitHub connected)
# 5. Update FRONTEND_URL once you know the static app URL

# === UPDATES ===
git add -A && git commit -m "your message" && git push origin experimental-deploy
az webapp deployment source sync --resource-group OrponRG --name orpon-backend-api   # backend
# frontend auto-deploys via GitHub Actions
```

---

> [!NOTE]
> **Redis is intentionally skipped** for this sandbox deployment to save costs. The app automatically uses an in-memory `Map` fallback. When you're ready for production, you can add Azure Cache for Redis and set `USE_REDIS=true`.

---

## 12. 📋 Post-Deployment Audit & Environment Fixes (June 2026)

During the June 2026 deployment cycle, we performed an audit and successfully completed the deployment of the backend to the Azure App Service. Below is a comprehensive record of the issues identified, the precise fixes applied, and the updated verification checklist.

### 12.1 – Environment Variable Adjustments & Mismatches Resolved

We found a critical mismatch between what the backend code expects and what was configured in Azure App Settings:
- **`DB_HOST` Alignment:** The backend database initialization script (`backend/config/db.js`) was configured to read `process.env.DB_HOST`. However, the App Service had it set as `DB_SERVER`. This mismatch caused the container to exit immediately on startup with a `TypeError: The "config.server" property is required and must be of type string` crash.
  - **Resolution:** Configured `DB_HOST=orpon-sql-server.database.windows.net` in the App Settings.
- **`JWT_SECRET` Initialization:** The required secret for encoding JWT tokens was missing in the Azure App Service configuration.
  - **Resolution:** Added a secure 32-byte hex generated key for `JWT_SECRET` to the environment.
- **Redundant Config Cleanup:** Removed the duplicate `DB_SERVER` entry to keep our environment variables clean and avoid confusion.

### 12.2 – Added Kudu Build Automation

To ensure that the Node.js application correctly installs its nested packages and runs pre-start steps on Azure Linux environment:
- **Setting:** Configured `SCM_DO_BUILD_DURING_DEPLOYMENT=true`. This tells Azure Kudu to execute `npm install` and resolve all required libraries during the deployment sync sequence.

### 12.3 – Added Health Endpoint `/api/health`

To verify container liveliness without needing authenticated routes, we added a lightweight, public health check route to the backend:
- **File Modified:** [backend/server.js](file:///home/shezan/Projects/Orpon/backend/server.js#L19-L21)
- **Path:** `GET https://orpon-backend-api-sea.azurewebsites.net/api/health`
- **Output Sample:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-06-02T12:11:04.726Z"
  }
  ```

### 12.4 – Final Verified API Endpoints

Once the deployment sync finished, we verified that the server is responding correctly:
- **Liveliness Check:** `/api/health` returns `200 OK` with status `ok`.
- **Database Query Capability:** `/api/campaigns` successfully talks to Azure SQL and returns `200 OK` with `{"success":true,"campaigns":[]}`.
- **Authentication Route Access:** `/api/me` returns `401 Unauthorized` (indicating the JWT middleware is fully active and intercepting invalid requests).
- **Validation Constraints:** `POST /api/register` correctly processes payload rules and returns `400 Bad Request` on empty submissions.

