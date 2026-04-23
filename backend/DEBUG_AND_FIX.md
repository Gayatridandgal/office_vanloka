# Multi-Tenant Debug Guide

## Problem: "Failed to fetch data" after enforcement

The backend now requires `org_id` column on all tenant tables. If fetch is failing, one of these is true:
1. Tables don't have `org_id` column yet
2. User account doesn't have `org_id` set
3. Existing data rows have NULL `org_id`

---

## Quick Debug Steps (3 minutes)

### Step 1: Check Current Tenant Status
After login, call this debug endpoint in your browser or Postman:
```
GET http://localhost:4000/api/debug/tenant
Authorization: Bearer <YOUR_JWT_TOKEN>
```

This will show:
- Your current `org_id` from token
- Which tables have `org_id` column
- Row counts per table and per your org

**Example response:**
```json
{
  "success": true,
  "currentOrgId": "aequs-org-001",
  "tableStatus": {
    "schemaa.\"officeVehicles\"": {
      "hasOrgIdColumn": true,
      "totalRows": 5,
      "orgRows": 2
    },
    "schemaa.\"officeEmployees\"": {
      "hasOrgIdColumn": false,
      "error": "Column org_id does not exist"
    }
  }
}
```

---

### Step 2: Add Missing org_id Columns

Run SQL in your Office database:

```sql
ALTER TABLE schemaa."officeEmployees" ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE schemaa."officeVehicles" ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE schemaa."officeDrivers" ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE schemaa."officeRoles" ADD COLUMN IF NOT EXISTS org_id TEXT;

CREATE INDEX IF NOT EXISTS idx_officeEmployees_org_id ON schemaa."officeEmployees" (org_id);
CREATE INDEX IF NOT EXISTS idx_officeVehicles_org_id ON schemaa."officeVehicles" (org_id);
CREATE INDEX IF NOT EXISTS idx_officeDrivers_org_id ON schemaa."officeDrivers" (org_id);
CREATE INDEX IF NOT EXISTS idx_officeRoles_org_id ON schemaa."officeRoles" (org_id);
```

---

### Step 3: Verify User Has org_id

Check your user account (admin@aequs.com):

```sql
SELECT id, email, org_id, tenant_id FROM schemaa."officeUsers" WHERE email = 'admin@aequs.com';
```

**If org_id is NULL**, update it:
```sql
UPDATE schemaa."officeUsers" 
SET org_id = 'aequs-org-001' 
WHERE email = 'admin@aequs.com';
```

---

### Step 4: Backfill Existing Data

Now backfill all existing rows with the correct org_id. Find your org IDs first:

```sql
SELECT DISTINCT org_id FROM schemaa."officeUsers" WHERE org_id IS NOT NULL;
```

Then backfill (replace `'YOUR_ORG_ID'` with actual value):

```sql
UPDATE schemaa."officeEmployees" SET org_id = 'YOUR_ORG_ID' WHERE org_id IS NULL;
UPDATE schemaa."officeVehicles" SET org_id = 'YOUR_ORG_ID' WHERE org_id IS NULL;
UPDATE schemaa."officeDrivers" SET org_id = 'YOUR_ORG_ID' WHERE org_id IS NULL;
UPDATE schemaa."officeRoles" SET org_id = 'YOUR_ORG_ID' WHERE org_id IS NULL;
```

---

### Step 5: Test Again

1. **Re-login** with admin@aequs.com
2. **Call debug endpoint** again - verify:
   - org_id appears in response
   - All tenant tables show `hasOrgIdColumn: true`
   - `orgRows > 0` if you added test data
3. **Fetch vehicles list** - should now work

---

## Expected Behavior After Fix

| Scenario | Result |
|----------|--------|
| TCS HR logs in, creates vehicle | Vehicle has `org_id = 'tcs-org'`, visible to TCS HR only |
| TCS HR lists vehicles | Shows only rows where `org_id = 'tcs-org'` |
| Infosys HR logs in, lists vehicles | Shows only rows where `org_id = 'infosys-org'`, TCS vehicles hidden |
| HR tries to edit vehicle from another org | 404 Not Found (row not visible in their org scope) |

---

## SQL Files Provided

1. **ADD_ORG_ID_STEP_BY_STEP.sql** - Full migration with all steps
2. **add_org_id_to_schemaa_tables.sql** - Automated PL/pgSQL version

---

## Still Failing?

Check backend logs for:
- `Tenant isolation not configured for X table`  
- `org_id is NULL in token`
- Database connection errors

If stuck, share:
1. Response from `/api/debug/tenant`
2. Backend console error
3. Your organization ID
