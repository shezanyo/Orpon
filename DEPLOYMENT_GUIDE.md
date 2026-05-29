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
5. [🗄️ Set Up the MySQL Database](#5-set-up-the-mysql-database)
6. [🖥️ Deploy Backend to Azure App Service](#6-deploy-backend-to-azure-app-service)
7. [🌐 Deploy Frontend to Azure Static Web Apps](#7-deploy-frontend-to-azure-static-web-apps)
8. [✅ Verify Everything Works](#8-verify-everything-works)
9. [🔄 How to Update Code After Deployment](#9-how-to-update-code-after-deployment)
10. [💰 Cost Management – Stay Free](#10-cost-management--stay-free)
11. [🔧 Troubleshooting](#11-troubleshooting)

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

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=donation_system

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

## 5. Set Up the MySQL Database

### 5.1 – Create Azure Database for MySQL (Flexible Server)

```bash
az mysql flexible-server create \
  --resource-group OrponRG \
  --name orpon-db-server \
  --admin-user orponadmin \
  --admin-password 'YourStrongPassword123!' \
  --location southeastasia \
  --sku-name Standard_B1ms \
  --storage-size 20 \
  --version 8.0.21 \
  --public-access 0.0.0.0
```

> [!IMPORTANT]
> - Replace `YourStrongPassword123!` with your own strong password (must include uppercase, lowercase, number, and special character).
> - `Standard_B1ms` is the cheapest burstable tier (~$6/month, covered by student credits).
> - `--public-access 0.0.0.0` means "allow all Azure services + my current IP". This is fine for sandbox testing.

### 5.2 – Create the database

```bash
az mysql flexible-server db create \
  --resource-group OrponRG \
  --server-name orpon-db-server \
  --database-name donation_system
```

### 5.3 – Create the tables

Connect using MySQL Workbench or command line:

```bash
mysql -h orpon-db-server.mysql.database.azure.com \
      -u orponadmin \
      -p \
      --ssl-mode=REQUIRED \
      donation_system
```

Then run whatever SQL schema your project uses to create the `users`, `campaigns`, `donations` tables, etc. The backend's auto-migration in `config/db.js` will add missing columns, but you need the base tables created first.

> [!TIP]
> If you already have a local MySQL dump, export it and import to Azure:
> ```bash
> # Export from local
> mysqldump -u root donation_system > orpon_schema.sql
>
> # Import to Azure
> mysql -h orpon-db-server.mysql.database.azure.com \
>       -u orponadmin -p --ssl-mode=REQUIRED \
>       donation_system < orpon_schema.sql
> ```

---

## 6. Deploy Backend to Azure App Service

### 6.1 – Create an App Service Plan + Web App

```bash
# Create plan (B1 = Basic tier, covered by student credits)
az appservice plan create \
  --name OrponPlan \
  --resource-group OrponRG \
  --sku B1 \
  --is-linux

# Create the web app (Node 20)
az webapp create \
  --resource-group OrponRG \
  --plan OrponPlan \
  --name orpon-backend-api \
  --runtime "NODE|20-lts"
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
    DB_HOST=orpon-db-server.mysql.database.azure.com \
    DB_USER=orponadmin \
    DB_PASSWORD='YourStrongPassword123!' \
    DB_NAME=donation_system \
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

> [!IMPORTANT]
> - `USE_REDIS=false` → the app will use the in-memory Map fallback. No Redis resource needed for sandbox testing (saves money).
> - All the `BKASH_*` and `SSLCOMMERZ_*` values are the **sandbox** keys. They will work for testing.
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
   - **Region:** East Asia (closest to Bangladesh)
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

Now that you know the frontend URL (e.g., `https://blue-sand-xxxxxxxx.eastasia.5.azurestaticapps.net`):

```bash
az webapp config appsettings set \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --settings FRONTEND_URL=https://blue-sand-xxxxxxxx.eastasia.5.azurestaticapps.net
```

This ensures payment callbacks redirect to the correct frontend domain.

---

## 8. Verify Everything Works

### ✅ Checklist

| Test | How | Expected Result |
|------|-----|-----------------|
| Backend is alive | Visit `https://orpon-backend-api.azurewebsites.net/api/campaigns` | JSON response (empty array or campaign data) |
| Frontend loads | Visit your Static Web App URL | The Orpon UI appears |
| User registration | Register a new user on the frontend | Success message, user stored in Azure MySQL |
| Create campaign | Create a test campaign | Campaign appears in the list |
| bKash sandbox payment | Click donate → bKash → complete sandbox flow | Redirected to bKash sandbox checkout, then back to your success page |
| SSLCommerz sandbox | Click donate → Card → complete sandbox flow | Redirected to SSLCommerz sandbox, then back to success |
| Transaction appears in DB | Check the `donations` table in Azure MySQL | Row with status `Completed` and blockchain hash |

### Quick DB check from terminal

```bash
mysql -h orpon-db-server.mysql.database.azure.com \
      -u orponadmin -p --ssl-mode=REQUIRED \
      -e "SELECT id, donor_name, amount, status, payment_method FROM donation_system.donations ORDER BY id DESC LIMIT 5;"
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
| App Service (backend) | B1 Linux | ~$13 (from credits) |
| MySQL Flexible Server | Standard_B1ms | ~$6 (from credits) |
| Static Web App (frontend) | Free tier | **$0** |
| Redis | *Not used (in-memory fallback)* | **$0** |
| **Total** | | **~$19/month from credits** |

> [!TIP]
> Your $100 lasts approximately **5 months** with this setup. When credits are running low, you can:
> - Switch the App Service to **F1 (Free)** tier (limited to 60 min CPU/day)
> - Stop the MySQL server when not using it: `az mysql flexible-server stop --resource-group OrponRG --name orpon-db-server`
> - Delete everything when done experimenting: `az group delete --name OrponRG --yes`

---

## 11. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| **Backend shows "Application Error"** | App crashed on startup | Run `az webapp log tail --resource-group OrponRG --name orpon-backend-api` and look for the error |
| **Cannot connect to MySQL** | Firewall blocking | Go to Azure Portal → MySQL server → Networking → check **"Allow public access from any Azure service"** is ON |
| **`ECONNREFUSED` in logs** | Wrong `DB_HOST` value | Verify the host is `orpon-db-server.mysql.database.azure.com` (the full FQDN, not just the server name) |
| **Frontend shows blank page** | `VITE_API_URL` not set at build time | Rebuild with the env var: `VITE_API_URL=https://... npm run build` |
| **CORS error in browser console** | Backend doesn't allow frontend origin | The current `server.js` uses `cors()` which allows everything – should work. If issues persist, check the `FRONTEND_URL` setting |
| **bKash sandbox returns 401** | Sandbox credentials expired or wrong | Verify credentials at [bKash sandbox portal](https://developer.bka.sh/) |
| **Payment callback goes to `localhost`** | `BACKEND_URL` still set to localhost | Update: `az webapp config appsettings set ... --settings BACKEND_URL=https://orpon-backend-api.azurewebsites.net` |
| **Static Web App build fails** | GitHub Actions workflow wrong | Check the `.github/workflows/` YAML – ensure `app_location: "/frontend"` and `output_location: "dist"` |
| **MySQL connection drops after idle** | Connection pool timeout | The `waitForConnections: true` in `db.js` handles this, but you can add `enableKeepAlive: true` to the pool config |

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
az mysql flexible-server create --resource-group OrponRG --name orpon-db-server --admin-user orponadmin --admin-password 'YourStrongPassword123!' --location southeastasia --sku-name Standard_B1ms --storage-size 20 --version 8.0.21 --public-access 0.0.0.0
az mysql flexible-server db create --resource-group OrponRG --server-name orpon-db-server --database-name donation_system
az appservice plan create --name OrponPlan --resource-group OrponRG --sku B1 --is-linux
az webapp create --resource-group OrponRG --plan OrponPlan --name orpon-backend-api --runtime "NODE|20-lts"

# 3. Deploy backend
az webapp config set --resource-group OrponRG --name orpon-backend-api --startup-file "node server.js"
az webapp config appsettings set --resource-group OrponRG --name orpon-backend-api --settings PORT=8080 DB_HOST=orpon-db-server.mysql.database.azure.com DB_USER=orponadmin DB_PASSWORD='YourStrongPassword123!' DB_NAME=donation_system BACKEND_URL=https://orpon-backend-api.azurewebsites.net FRONTEND_URL=https://your-frontend-url JWT_SECRET=change-this USE_REDIS=false BKASH_USERNAME=sandboxTokenizedUser02 BKASH_PASSWORD='sandboxTokenizedUser02@12345' BKASH_APP_KEY=4f6o0cjiki2rfm34kfdadl1eqq BKASH_APP_SECRET=2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta SSLCOMMERZ_STORE_ID=testbox SSLCOMMERZ_STORE_PASSWORD=qwerty SSLCOMMERZ_BASE_URL=https://sandbox.sslcommerz.com
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
