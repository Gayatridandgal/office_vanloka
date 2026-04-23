# HOW TO RUN: Add org_id to All Tables

Created: `backend/sql/ALTER_ADD_ORG_ID_AUTO.sql`

## Option 1: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to your Office database
3. Go to Query Tool
4. Paste the entire contents of `backend/sql/ALTER_ADD_ORG_ID_AUTO.sql`
5. Click **Execute** button (F5)
6. Check the console output for "Schema migration complete!"

## Option 2: Using psql (Command Line)
```powershell
psql -h localhost -U postgres -d office -f "C:\Users\sagar\office_vanloka\backend\sql\ALTER_ADD_ORG_ID_AUTO.sql"
```

## What This Script Does
✅ Adds `org_id` column to:
  - officeEmployees
  - officeVehicles
  - officeDrivers
  - officeRoles
  - officePermissions
  - officeUsers

✅ Auto-fills with default org_id (from first user or 'default-org')

✅ Creates indexes on org_id for performance

✅ Runs verification queries to confirm success

## After Running Script
1. Check verification output - should show `has_org_id: true` for all tables
2. Try login again: `admin@aequs.com / Aequs@2026`
3. Test vehicle list endpoint

---

**Run this NOW and share the output with me!**
