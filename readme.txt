npx typeorm migration:generate ./src/migrations/Chat -d ./data-source.ts
npx typeorm migration:run -d ./data-source.ts

# Super Admin Migration
npx typeorm migration:generate ./src/migrations/SuperAdminAndPayments -d ./data-source.ts
npx typeorm migration:run -d ./data-source.ts

# Environment Variables Setup
# 1. Copy .env.example to .env
# 2. Update SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env
# 3. Never commit .env file to version control

# Note: Super Admin seeder runs automatically on application startup
# Credentials are loaded from environment variables