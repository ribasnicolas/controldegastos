-- Enable Row-Level Security on every table in the public schema.
-- This app talks to Postgres only through Prisma using the table-owning
-- role (DATABASE_URL/DIRECT_URL), which bypasses RLS entirely, so this
-- has no effect on the app. Its only purpose is to lock out Supabase's
-- auto-generated PostgREST/GraphQL API, which otherwise exposes every
-- public table (including User.password) to anyone with the project's
-- anon key. No policies are created, so those API roles get zero access.

ALTER TABLE "Household" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Income" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringExpense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringIncome" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavingEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Debt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Liability" ENABLE ROW LEVEL SECURITY;
