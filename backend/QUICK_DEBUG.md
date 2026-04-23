# IMMEDIATE DEBUG STEPS - DO THIS NOW

## Step 1: Check Backend Logs
Look at your terminal where backend is running (bun --watch src/server.ts).
Copy any error messages starting with [AUTH] or [VEHICLES] or [EMPLOYEES].
Share those with me.

## Step 2: Test Login Endpoint Directly
Open Postman or curl and try login:

```bash
curl -X POST http://localhost:4000/api/tenant-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@aequs.com", "password": "Aequs@2026"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "...",
      "name": "...",
      "email": "admin@aequs.com",
      "role": "admin",
      "org_id": "SHOULD_HAVE_VALUE_HERE"
    }
  }
}
```

**Share the actual response you get.**

## Step 3: If Login Shows Error
If response says "User is not mapped to any organization" - means admin@aequs.com row doesn't have org_id/tenant_id set in users table.

Run in Office DB:
```sql
-- Check the user
SELECT id, email, org_id, tenant_id FROM schemaa."officeUsers" 
WHERE LOWER(email) = LOWER('admin@aequs.com');

-- If org_id and tenant_id are NULL, set org_id:
UPDATE schemaa."officeUsers" 
SET org_id = 'aequs-org-001' 
WHERE LOWER(email) = LOWER('admin@aequs.com');
```

Then try login again.

## Step 4: If Login Succeeds, Test Vehicle List
```bash
curl -X GET http://localhost:4000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace YOUR_TOKEN_HERE with the token from login response.

**Share the response.**

## Step 5: If Vehicle List Shows Error
Common error: "Tenant isolation not configured for vehicles table"

This means officeVehicles table doesn't have org_id column. Run in Office DB:

```sql
-- Add org_id to vehicles
ALTER TABLE schemaa."officeVehicles" ADD COLUMN IF NOT EXISTS org_id TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_officeVehicles_org_id ON schemaa."officeVehicles" (org_id);

-- Backfill with org_id from login (replace 'aequs-org-001' with your actual org_id)
UPDATE schemaa."officeVehicles" 
SET org_id = 'aequs-org-001' 
WHERE org_id IS NULL;

-- Verify
SELECT COUNT(*) as total, COUNT(org_id) as with_org_id FROM schemaa."officeVehicles";
```

Then try vehicle list again.

---

## Summary - Share These:
1. Your backend console output when you try to login
2. Response from login endpoint (curl output)
3. Response from vehicle list endpoint (after successful login)
4. Output of SQL queries showing:
   - admin@aequs.com user record
   - officeUsers table columns
   - officeVehicles table columns and row count
