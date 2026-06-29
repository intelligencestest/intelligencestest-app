-- ============================================================
-- Test seed: creates a company + admin login for local testing
-- Run in: Supabase Dashboard → SQL Editor → New query
--
-- Login credentials after running this:
--   Email:    admin@testcompany.com
--   Password: Admin1234!
--
-- NOTE: If you already ran a previous version of this script
-- and login failed, run the DELETE block first to clean up,
-- then the INSERT block. Both are included below.
-- ============================================================

-- Step 0: Clean up any previous failed attempt (safe to run even if nothing exists)
DELETE FROM public.users     WHERE id = '22222222-2222-2222-2222-222222222222';
DELETE FROM auth.identities  WHERE user_id = '22222222-2222-2222-2222-222222222222';
DELETE FROM auth.users       WHERE id = '22222222-2222-2222-2222-222222222222';
DELETE FROM public.companies WHERE id = '11111111-1111-1111-1111-111111111111';

-- Step 1: Create the test company
INSERT INTO public.companies (id, name, email)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Test Company',
  'admin@testcompany.com'
);

-- Step 2: Create the Supabase auth user row
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'admin@testcompany.com',
  crypt('Admin1234!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Step 3: Create the auth identity — REQUIRED for login to work
-- (Direct auth.users inserts fail silently without this row)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'admin@testcompany.com',
  format(
    '{"sub":"%s","email":"%s","email_verified":true}',
    '22222222-2222-2222-2222-222222222222',
    'admin@testcompany.com'
  )::jsonb,
  'email',
  now(),
  now(),
  now()
);

-- Step 4: Create the user profile linking auth user → company
INSERT INTO public.users (id, company_id, full_name, email, role)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Test Admin',
  'admin@testcompany.com',
  'admin'
);
