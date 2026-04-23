-- Check and add org_id to USERS table (if missing)
-- Users table needs org_id so login can extract it

-- Step 1: Check users table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'schemaa' 
  AND table_name = 'officeUsers'
ORDER BY column_name;

-- Step 2: Add org_id column to users table if missing
ALTER TABLE schemaa."officeUsers" ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE schemaa."officeUsers" ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 3: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_officeUsers_org_id ON schemaa."officeUsers" (org_id);

-- Step 4: VERIFY admin@aequs.com has org_id set
SELECT id, email, org_id, tenant_id FROM schemaa."officeUsers" WHERE LOWER(email) = LOWER('admin@aequs.com');

-- Step 5: If org_id is NULL, set it to a test value
-- First, get all distinct org values if they exist elsewhere
SELECT DISTINCT 
  COALESCE(org_id, tenant_id, 'aequs-org-001') as org_id_value
FROM schemaa."officeUsers" 
WHERE org_id IS NOT NULL OR tenant_id IS NOT NULL
LIMIT 1;

-- Step 6: Then backfill admin@aequs.com with org_id (replace value)
UPDATE schemaa."officeUsers" 
SET org_id = 'aequs-org-001' 
WHERE LOWER(email) = LOWER('admin@aequs.com') AND org_id IS NULL;

-- Step 7: Do same for other users (get all users and their org_id)
SELECT COUNT(*) as total_users, 
       COUNT(org_id) as users_with_org_id,
       COUNT(DISTINCT org_id) as distinct_orgs
FROM schemaa."officeUsers";
