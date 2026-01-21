npx typeorm migration:generate ./src/migrations/Chat -d ./data-source.ts
npx typeorm migration:run -d ./data-source.ts