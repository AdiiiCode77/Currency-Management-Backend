npx typeorm migration:generate ./src/migrations/Chat -d ./data-source.ts
npx typeorm migration:run -d ./data-source.ts

# Super Admin Migration
npx typeorm migration:generate ./src/migrations/SuperAdminAndPayments -d ./data-source.ts
npx typeorm migration:run -d ./data-source.ts

# Note: Super Admin seeder runs automatically on application startup
# Default credentials: superadmin@dirham.com / SuperAdmin@123