#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting prompts.chat application...${NC}"

# Check if DATABASE_URL is set and is not a dummy value
if [[ -z "$DATABASE_URL" ]]; then
  echo -e "${RED}❌ ERROR: DATABASE_URL is not set${NC}"
  exit 1
fi

# Don't run migrations if using dummy database (Docker build stage)
if [[ "$DATABASE_URL" == *"dummy"* ]]; then
  echo -e "${YELLOW}⏭️  Skipping migrations (dummy database detected)${NC}"
else
  echo -e "${GREEN}📊 Running database migrations...${NC}"
  
  # Try to run migrations, but don't fail if they're already applied
  if npx prisma migrate deploy 2>/dev/null; then
    echo -e "${GREEN}✅ Migrations completed successfully${NC}"
  else
    echo -e "${YELLOW}⚠️  Migrations: some may already be applied${NC}"
  fi
fi

echo -e "${GREEN}🎯 Starting Next.js server...${NC}"

# Start the application
exec npm start
