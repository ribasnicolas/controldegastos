-- Prisma's own migration-history table also lives in the public schema,
-- so Supabase's PostgREST API exposes it too unless RLS is enabled.
-- Same as the app tables: Prisma connects as the table owner and bypasses
-- RLS, so this has no effect on migrations/app behavior.

ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
