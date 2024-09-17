

## Deploying to Vercel

This project contains configuration files (`vercel.json`) for each app (`mm-backend` and `tse-backend`). Deployment to Vercel is possible and can be done through the Vercel dashboard.
1. Navigate to the Vercel dashboard.
2. Import your Git repository.
3. During the project setup, specify the root directory for the app (e.g., `packages/mm-backend` or `packages/tse-backend`).
4. Vercel will automatically use the `vercel.json` configuration file located in the specified directory.


## Migrations

```bash
# generate a migration file with the name 'Name'
$ pnpm run migration:generate ./migrations/Name

# execute the migrations
$ pnpm run migration:run

# revert the most recent migration
$ pnpm run migration:revert
```
