#!/bin/bash

# ============================================
# Orpon - Ledger Integrity Audit Fix Deployment
# ============================================
# This script verifies all changes and prepares for deployment
# Run this before pushing to production

set -e  # Exit on any error

echo "🚀 Orpon Ledger Integrity Audit Fix - Deployment Verification"
echo "=============================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify all files exist
echo "📋 Step 1: Verifying modified files..."
files_to_check=(
    "backend/controllers/adminController.js"
    "frontend/src/pages/AdminDashboard.jsx"
    "frontend/src/utils/api.js"
    "LEDGER_INTEGRITY_FIX.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file exists"
    else
        echo -e "  ${RED}✗${NC} $file NOT FOUND"
        exit 1
    fi
done
echo ""

# Step 2: Check backend syntax
echo "🔍 Step 2: Checking backend JavaScript syntax..."
if node -c backend/controllers/adminController.js 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Backend syntax is valid"
else
    echo -e "  ${RED}✗${NC} Backend syntax error detected"
    exit 1
fi
echo ""

# Step 3: Build frontend
echo "🏗️  Step 3: Building frontend for production..."
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Frontend built successfully"
    BUILD_SIZE=$(du -sh dist/ | cut -f1)
    echo "  Size: $BUILD_SIZE"
else
    echo -e "  ${RED}✗${NC} Frontend build failed"
    exit 1
fi
cd ..
echo ""

# Step 4: Verify dependencies
echo "📦 Step 4: Checking dependencies..."
if [ -d "backend/node_modules" ]; then
    echo -e "  ${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "  ${YELLOW}⚠${NC}  Backend dependencies not installed"
    echo "  Run: cd backend && npm install"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "  ${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "  ${YELLOW}⚠${NC}  Frontend dependencies not installed"
    echo "  Run: cd frontend && npm install"
fi
echo ""

# Step 5: Verify .env file
echo "🔐 Step 5: Checking environment configuration..."
if [ -f "backend/.env" ]; then
    echo -e "  ${GREEN}✓${NC} backend/.env exists (keep this secret!)"
    if grep -q "DB_HOST" backend/.env; then
        echo -e "  ${GREEN}✓${NC} Database configuration found"
    else
        echo -e "  ${RED}✗${NC} Database configuration missing"
        exit 1
    fi
else
    echo -e "  ${YELLOW}⚠${NC}  backend/.env not found - will be needed for production"
fi
echo ""

# Step 6: Git status check
echo "📝 Step 6: Checking Git status..."
if git status --porcelain > /dev/null 2>&1; then
    CHANGES=$(git status --porcelain | wc -l)
    echo -e "  ${GREEN}✓${NC} Git repository detected"
    echo "  Uncommitted changes: $CHANGES"
    if [ $CHANGES -gt 0 ]; then
        echo -e "  ${YELLOW}⚠${NC}  Recommend committing changes before deployment"
        echo ""
        echo "  Quick commit:"
        echo "  git add -A"
        echo "  git commit -m 'fix: resolve ledger integrity audit display issue'"
    fi
else
    echo -e "  ${YELLOW}⚠${NC}  Not a git repository"
fi
echo ""

# Step 7: Summary
echo "✅ Deployment Verification Complete!"
echo "=============================================================="
echo ""
echo "📋 Files Modified:"
echo "  1. backend/controllers/adminController.js - Enhanced verifyIntegrity()"
echo "  2. frontend/src/pages/AdminDashboard.jsx - Improved handleVerifyIntegrity()"
echo "  3. frontend/src/utils/api.js - Added request/response logging"
echo ""
echo "📖 Documentation:"
echo "  - LEDGER_INTEGRITY_FIX.md - Full fix details and test scenarios"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "  1. Commit changes to Git:"
echo "     git add -A"
echo "     git commit -m 'fix: resolve ledger integrity audit display issue'"
echo ""
echo "  2. Push to your deployment branch:"
echo "     git push origin <your-branch-name>"
echo ""
echo "  3. Deploy to Azure:"
echo "     - Backend: Push to Azure App Service"
echo "     - Frontend: Push to Azure Static Web Apps"
echo ""
echo "  4. Test in production:"
echo "     - Navigate to Admin Dashboard"
echo "     - Click 'Ledger Integrity Audit'"
echo "     - Status should show 'VALID' in green if ledger is clean"
echo ""
echo "  5. Monitor in browser console:"
echo "     - Filter console by [AdminDashboard]"
echo "     - Filter console by [apiCall]"
echo ""
echo "For detailed testing instructions, see: LEDGER_INTEGRITY_FIX.md"
echo ""
