-- RUN THESE QUERIES IN YOUR OFFICE DATABASE AND SHARE THE OUTPUT WITH ME

-- 1. Check if users table exists and what columns it has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'schemaa' AND table_name IN ('officeUsers', 'officeEmployees', 'officeVehicles', 'officeDrivers')
ORDER BY table_name, ordinal_position;

-- 2. Check admin@aequs.com user record
SELECT * FROM schemaa."officeUsers" WHERE LOWER(email) = 'admin@aequs.com';

-- 3. Check if org_id column exists in main tables
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'schemaa' AND column_name = 'org_id';

-- 4. Count records in each tenant table
SELECT 'officeUsers' as table_name, COUNT(*) as total_rows FROM schemaa."officeUsers"
UNION ALL
SELECT 'officeEmployees', COUNT(*) FROM schemaa."officeEmployees"
UNION ALL
SELECT 'officeVehicles', COUNT(*) FROM schemaa."officeVehicles"
UNION ALL
SELECT 'officeDrivers', COUNT(*) FROM schemaa."officeDrivers";

-- 5. Check if any vehicles exist
SELECT id, vehicle_number, org_id FROM schemaa."officeVehicles" LIMIT 5;

-- 6. Show password column info (check what password field exists)
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'schemaa' 
  AND table_name = 'officeUsers'
  AND column_name IN ('password', 'password_hash', 'hashed_password');
