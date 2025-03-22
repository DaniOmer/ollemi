# Database Migrations

This directory contains all the database migrations for the Ollemi project.

## Migration Files

Migration files are named with a sequential number prefix and a descriptive name, e.g.:

- `0001_initial_schema.sql` - The initial database schema
- `0002_add_user_preferences.sql` - Adds user preferences table

## How to Create a New Migration

To create a new migration:

```bash
npm run db:new your_migration_name
```

This will create a new timestamp-based migration file in this directory.

## How to Apply Migrations

To apply pending migrations to your development database:

```bash
npm run db:up
```

## How to Reset Database

If you need to reset your database to a clean state:

```bash
npm run db:reset
```

## Production Deployment

When deploying to production, either:

1. Use the Supabase dashboard to run migrations manually
2. Set up CI/CD to run migrations using the Supabase CLI

## Best Practices

1. Keep migrations small and focused on a single change
2. Always test migrations on a development database before applying to production
3. Include both "up" (apply changes) and "down" (reverse changes) logic when possible
4. Use transactions for data-modifying operations to ensure atomicity
