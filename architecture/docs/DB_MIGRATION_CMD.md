## Manual Database Migrations

### Generate a new migration file

```bash
pnpm run migration:generate ./migrations/YourMigrationName
```

### Run all pending migrations

```bash
pnpm run migration:run
```

### Revert the most recent migration

```bash
pnpm run migration:revert
```

---