#!/bin/bash

###############################################################################
# Deploy Script - ServicesV2 to Staging
# 
# Este script automatiza el deployment de ServicesV2 a staging
# 
# Uso: ./deploy-staging.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BRANCH="staging/servicesv2"
REMOTE="origin"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  MDR Construcciones - ServicesV2 Deployment to Staging    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Pre-deployment checks
echo -e "${YELLOW}[1/10] Running pre-deployment checks...${NC}"

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}✗ Git working directory is not clean${NC}"
    echo -e "${YELLOW}Please commit or stash your changes before deploying${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git working directory is clean${NC}"

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "$BRANCH" ]]; then
    echo -e "${YELLOW}⚠ You are on branch: $CURRENT_BRANCH${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 2: Run tests
echo -e "${YELLOW}[2/10] Running tests...${NC}"
# Uncomment when tests are available
# php artisan test
echo -e "${GREEN}✓ Tests passed (skipped - no tests configured)${NC}"

# Step 3: Install dependencies
echo -e "${YELLOW}[3/10] Installing dependencies...${NC}"
composer install --no-dev --optimize-autoloader
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Build assets
echo -e "${YELLOW}[4/10] Building production assets...${NC}"
npm run build
echo -e "${GREEN}✓ Assets built successfully${NC}"

# Step 5: Create staging branch if doesn't exist
echo -e "${YELLOW}[5/10] Preparing staging branch...${NC}"
if git show-ref --verify --quiet refs/heads/$BRANCH; then
    git checkout $BRANCH
    git merge main --no-edit
else
    git checkout -b $BRANCH
fi
echo -e "${GREEN}✓ Staging branch ready${NC}"

# Step 6: Commit built assets
echo -e "${YELLOW}[6/10] Committing built assets...${NC}"
git add public/build -f
git commit -m "build: Compile assets for staging deployment [skip ci]" || echo "No changes to commit"
echo -e "${GREEN}✓ Assets committed${NC}"

# Step 7: Push to remote
echo -e "${YELLOW}[7/10] Pushing to remote...${NC}"
git push $REMOTE $BRANCH --force-with-lease
echo -e "${GREEN}✓ Pushed to $REMOTE/$BRANCH${NC}"

# Step 8: Generate deployment info
echo -e "${YELLOW}[8/10] Generating deployment info...${NC}"
COMMIT_HASH=$(git rev-parse --short HEAD)
DEPLOY_DATE=$(date '+%Y-%m-%d %H:%M:%S')
cat > deployment-info.json <<EOF
{
  "version": "2.0.0",
  "environment": "staging",
  "branch": "$BRANCH",
  "commit": "$COMMIT_HASH",
  "deployed_at": "$DEPLOY_DATE",
  "deployed_by": "$(git config user.name)"
}
EOF
echo -e "${GREEN}✓ Deployment info generated${NC}"

# Step 9: Display next steps
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Deployment to Staging Complete!                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Code pushed to: $REMOTE/$BRANCH${NC}"
echo -e "${GREEN}✓ Commit: $COMMIT_HASH${NC}"
echo ""
echo -e "${YELLOW}Next steps on staging server:${NC}"
echo ""
echo -e "  ${BLUE}1.${NC} SSH into staging server"
echo -e "     ${YELLOW}ssh user@staging.mdrconstrucciones.com${NC}"
echo ""
echo -e "  ${BLUE}2.${NC} Navigate to project directory"
echo -e "     ${YELLOW}cd /var/www/mdrconstrucciones${NC}"
echo ""
echo -e "  ${BLUE}3.${NC} Pull latest changes"
echo -e "     ${YELLOW}git pull origin $BRANCH${NC}"
echo ""
echo -e "  ${BLUE}4.${NC} Run migrations"
echo -e "     ${YELLOW}php artisan migrate --force${NC}"
echo ""
echo -e "  ${BLUE}5.${NC} Seed ServicesV2 data (if needed)"
echo -e "     ${YELLOW}php artisan db:seed --class=ServiceV2DataSeeder${NC}"
echo ""
echo -e "  ${BLUE}6.${NC} Clear caches"
echo -e "     ${YELLOW}php artisan cache:clear${NC}"
echo -e "     ${YELLOW}php artisan config:clear${NC}"
echo -e "     ${YELLOW}php artisan view:clear${NC}"
echo -e "     ${YELLOW}php artisan route:clear${NC}"
echo ""
echo -e "  ${BLUE}7.${NC} Optimize for production"
echo -e "     ${YELLOW}php artisan config:cache${NC}"
echo -e "     ${YELLOW}php artisan route:cache${NC}"
echo -e "     ${YELLOW}php artisan view:cache${NC}"
echo ""
echo -e "  ${BLUE}8.${NC} Restart services"
echo -e "     ${YELLOW}sudo systemctl restart php8.2-fpm${NC}"
echo -e "     ${YELLOW}sudo systemctl reload nginx${NC}"
echo ""
echo -e "${YELLOW}Testing URLs:${NC}"
echo -e "  ${BLUE}•${NC} ServicesV2: ${GREEN}https://staging.mdrconstrucciones.com/servicios-v2/construccion-viviendas${NC}"
echo -e "  ${BLUE}•${NC} Admin: ${GREEN}https://staging.mdrconstrucciones.com/admin/services${NC}"
echo ""
echo -e "${YELLOW}Monitoring:${NC}"
echo -e "  ${BLUE}•${NC} Check error logs: ${YELLOW}tail -f storage/logs/laravel.log${NC}"
echo -e "  ${BLUE}•${NC} Check nginx logs: ${YELLOW}tail -f /var/log/nginx/error.log${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 10: Return to main branch
echo -e "${YELLOW}[10/10] Returning to main branch...${NC}"
git checkout main
echo -e "${GREEN}✓ Returned to main branch${NC}"
echo ""
echo -e "${GREEN}Deployment preparation complete! 🚀${NC}"

