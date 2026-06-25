# Supabase Setup

This document tracks the BrewMapKR Supabase setup steps.

## Project

- Project name: BrewMapKR
- Project ref: tymgcvdlbpmikxriboel
- Project URL: https://tymgcvdlbpmikxriboel.supabase.co
- Region: ap-northeast-1, Tokyo

## Local Environment

The local project URL and publishable key are stored in `.env.local`.
This file is ignored by Git. Keep `SUPABASE_SERVICE_ROLE_KEY` out of browser code and do not share it in screenshots or chat.

Vercel environment variables to add later:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
BREWMAP_ADMIN_USER
BREWMAP_ADMIN_PASSWORD
```

## Step 5: Create Tables And RLS

1. Open Supabase Dashboard.
2. Go to `SQL Editor`.
3. Create a new query.
4. Paste the full contents of `supabase/migrations/20260625000000_initial_schema.sql`.
5. Click `Run`.
6. Confirm these tables exist in `Table Editor`:
   - `users`
   - `cafes`
   - `coffee_capabilities`
   - `cafe_capabilities`
   - `evidences`
   - `saved_lists`
   - `saved_cafes`
   - `reports`
   - `admin_logs`

## Admin Role

After creating your first Supabase Auth user, promote that user manually in SQL Editor:

```sql
update public.users
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL@example.com';
```

## Step 6: Import Seed Cafe Data

Generate the SQL seed file from the CSV:

```bash
npm run supabase:seed:sql
```

Then import it in Supabase:

1. Open `SQL Editor`.
2. Create a new query.
3. Paste the full contents of `supabase/seed.sql`.
4. Click `Run`.
5. Confirm row counts in `Table Editor`:
   - `coffee_capabilities`: 21 rows
   - `cafes`: 113 rows
   - `cafe_capabilities`: 283 rows

The generated SQL is safe to run again. It upserts capabilities and cafes, then refreshes capability links for the seed cafes.

## Next Step

## Step 7: Read Public Cafes From Supabase

The public cafe read path now uses Vercel/Next API route `app/api/cafes/route.js`:

```text
Browser -> /api/cafes -> Supabase REST API -> cafes + cafe_capabilities
```

`src/main.js` calls `/api/cafes` first and keeps `/data/seed-cafes.csv` as a fallback if Supabase is unavailable.

## Next Step

After `/api/cafes` is verified in Vercel, connect login and saved cafes to Supabase Auth and the `saved_lists` / `saved_cafes` tables.
