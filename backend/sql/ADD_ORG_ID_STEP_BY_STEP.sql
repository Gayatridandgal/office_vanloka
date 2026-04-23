-- STEP-BY-STEP: Add org_id to schemaa tables for multi-tenant isolation
-- Execute these commands one at a time in your Office database
-- This is SAFE to run multiple times (uses IF NOT EXISTS)

-- Step 1: Add org_id column to employees table
ALTER TABLE schemaa."officeEmployees" ADD COLUMN IF NOT EXISTS org_id TEXT;

-- Step 2: Add org_id column to vehicles table
ALTER TABLE schemaa."officeVehicles" ADD COLUMN IF NOT EXISTS org_id TEXT;

-- Step 3: Add org_id column to drivers table
ALTER TABLE schemaa."officeDrivers" ADD COLUMN IF NOT EXISTS org_id TEXT;

-- Step 4: Add org_id column to roles table
ALTER TABLE schemaa."officeRoles" ADD COLUMN IF NOT EXISTS org_id TEXT;

-- Step 5: Create indexes on org_id for fast queries
CREATE INDEX IF NOT EXISTS idx_officeEmployees_org_id ON schemaa."officeEmployees" (org_id);
CREATE INDEX IF NOT EXISTS idx_officeVehicles_org_id ON schemaa."officeVehicles" (org_id);
CREATE INDEX IF NOT EXISTS idx_officeDrivers_org_id ON schemaa."officeDrivers" (org_id);
CREATE INDEX IF NOT EXISTS idx_officeRoles_org_id ON schemaa."officeRoles" (org_id);

-- Step 6: BACKFILL existing rows with org_id from users table
-- Replace the org_id values below with your actual organization IDs

-- For TCS employees/vehicles/drivers (assuming org_id for TCS is stored in users table)
-- First, check what org_ids exist in your users table:
SELECT DISTINCT org_id, tenant_id FROM schemaa."officeUsers" WHERE org_id IS NOT NULL OR tenant_id IS NOT NULL;

-- Then backfill using one of these approaches:

-- Approach A: If you know the org_id directly
UPDATE schemaa."officeEmployees" SET org_id = 'YOUR_ORG_ID_HERE' WHERE org_id IS NULL;
UPDATE schemaa."officeVehicles" SET org_id = 'YOUR_ORG_ID_HERE' WHERE org_id IS NULL;
UPDATE schemaa."officeDrivers" SET org_id = 'YOUR_ORG_ID_HERE' WHERE org_id IS NULL;

-- Approach B: If you need to link by user (replace with actual user emails)
-- Update employee records by finding their user's org_id
UPDATE schemaa."officeEmployees" e
SET org_id = u.org_id
FROM schemaa."officeUsers" u
WHERE e.email = u.email AND e.org_id IS NULL AND u.org_id IS NOT NULL;

-- Step 7: VERIFY data was backfilled correctly
SELECT org_id, COUNT(*) as count FROM schemaa."officeEmployees" GROUP BY org_id;
SELECT org_id, COUNT(*) as count FROM schemaa."officeVehicles" GROUP BY org_id;
SELECT org_id, COUNT(*) as count FROM schemaa."officeDrivers" GROUP BY org_id;

-- Step 8: OPTIONAL - Make org_id mandatory (enforce NOT NULL after backfill is verified)
-- ALTER TABLE schemaa."officeEmployees" ALTER COLUMN org_id SET NOT NULL;
-- ALTER TABLE schemaa."officeVehicles" ALTER COLUMN org_id SET NOT NULL;
-- ALTER TABLE schemaa."officeDrivers" ALTER COLUMN org_id SET NOT NULL;
-- ALTER TABLE schemaa."officeRoles" ALTER COLUMN org_id SET NOT NULL;

-- Step 9: Check admin@aequs.com user has org_id set
SELECT id, email, org_id, tenant_id FROM schemaa."officeUsers" WHERE email = 'admin@aequs.com';
-- If org_id is NULL, update it:
-- UPDATE schemaa."officeUsers" SET org_id = 'AEQUS_ORG_ID' WHERE email = 'admin@aequs.com';
