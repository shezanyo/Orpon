# 🔧 Azure Payment Sandbox Fix Guide

## Problem
Payment sandbox (bKash, Card, Nagad) doesn't work in live Azure deployment.

## Root Cause
The backend's payment controllers need these environment variables to construct proper redirect URLs:
- `BACKEND_URL` - for payment gateway callbacks
- `FRONTEND_URL` - for redirecting users after payment

Without these properly configured in Azure, payment redirects go to `undefined/...` paths.

---

## ✅ Quick Fix: Update Azure App Service Settings

### Step 1: Find Your Deployed URLs

First, get your actual URLs from Azure:

**Frontend URL:**
- Go to [Azure Portal](https://portal.azure.com)
- Search for "Static Web Apps"
- Click on "orpon-frontend"
- Copy the "URL" (looks like: `https://thankful-sea-0f5fbd000.7.azurestaticapps.net`)

**Backend URL:**
- Go to App Services
- Click on "orpon-backend-api"
- Copy the "Default domain" (looks like: `https://orpon-backend-api-sea.azurewebsites.net`)

### Step 2: Update Backend Settings in Azure Portal

**Option A: Via Azure Portal (GUI)**

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "App Services" → click "orpon-backend-api"
3. In left menu: **Configuration** → **Application settings**
4. Click **+ New application setting** for each:

| Name | Value |
|------|-------|
| `BACKEND_URL` | `https://orpon-backend-api-sea.azurewebsites.net` |
| `FRONTEND_URL` | `https://thankful-sea-0f5fbd000.7.azurestaticapps.net` |

5. Click **Save** → Confirm "Yes" to restart the app

**Option B: Via Azure CLI (Terminal)**

```bash
az webapp config appsettings set \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --settings \
    BACKEND_URL=https://orpon-backend-api-sea.azurewebsites.net \
    FRONTEND_URL=https://thankful-sea-0f5fbd000.7.azurestaticapps.net
```

### Step 3: Verify Backend Logs

After updating, check if the backend started correctly:

```bash
az webapp log tail \
  --resource-group OrponRG \
  --name orpon-backend-api
```

You should see:
```
✅ All required environment variables are set

📍 Current Configuration:
   Backend URL: https://orpon-backend-api-sea.azurewebsites.net
   Frontend URL: https://thankful-sea-0f5fbd000.7.azurestaticapps.net
   Database: ...
```

---

## 🧪 Test Payment Sandbox

### For Nagad:

1. Go to your deployed frontend: `https://your-frontend-url.azurestaticapps.net`
2. Click on any campaign → Click "Donate" → Select "Nagad"
3. Enter an amount and click "Continue"
4. You should be redirected to the Nagad sandbox form
5. Enter:
   - Mobile: `01700000000` (any valid 11-digit BD number)
   - OTP: `123456`
   - PIN: `12121`
6. Should redirect to "Payment Success" page ✅

### For bKash & Card:
Same flow, but select bKash or Card as payment method. Payment gates will redirect you to their sandbox environments.

---

## 🐛 Troubleshooting

### "Payment sandbox doesn't load" or "Redirected to undefined"
- **Cause:** `FRONTEND_URL` or `BACKEND_URL` not set in Azure
- **Fix:** Follow **Step 2** above to set these variables

### "Cannot connect to backend" (CORS errors)
- **Cause:** Frontend trying to reach old/wrong backend URL
- **Fix:** 
  1. Check `VITE_API_URL` is set correctly in GitHub Actions workflow
  2. Rebuild frontend: `git push` to `experimental-deploy` branch

### "Database connection failed"
- **Cause:** `DB_HOST`, `DB_USER`, `DB_PASSWORD` incorrect
- **Fix:** Verify Azure SQL credentials and firewall settings

### "Session expired" (payment session errors)
- **Cause:** Redis not configured, in-memory storage limited
- **Fix:** Normal behavior for sandbox. Just try again.

---

## 📋 Environment Variables Checklist

Before considering the fix complete, verify all these are set in Azure:

```bash
az webapp config appsettings list \
  --resource-group OrponRG \
  --name orpon-backend-api \
  --query "[].{name: name, value: value}" \
  --output table
```

Expected output should include:
- ✅ `BACKEND_URL=https://orpon-backend-api-sea.azurewebsites.net`
- ✅ `FRONTEND_URL=https://your-static-app-url.azurestaticapps.net`
- ✅ `DB_HOST=orpon-sql-server.database.windows.net`
- ✅ `DB_USER=orponadmin`
- ✅ `JWT_SECRET=<some-value>`
- ✅ All BKASH_* and SSLCOMMERZ_* variables

---

## 🔄 After Fixing

1. Test payment sandbox in deployed app
2. Monitor logs for errors: `az webapp log tail --resource-group OrponRG --name orpon-backend-api`
3. Check [Application Insights](https://portal.azure.com) for any exceptions

If issues persist, please check:
- Recent error logs: `az webapp log download --resource-group OrponRG --name orpon-backend-api`
- Database connectivity: Can the backend reach Azure SQL?
- Static Web Apps configuration: Is `staticwebapp.config.json` properly configured?
