-- ALTER TABLES IN SCHEMAA SCHEMA TO ADD org_id COLUMN
-- Adds org_id column to all office* tables for multi-tenant isolation
-- org_id is auto-filled with default value 'default-org'

ALTER TABLE schemaa."officeDrivers" ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'default-org';
CREATE INDEX IF NOT EXISTS idx_officeDrivers_org_id ON schemaa."officeDrivers" (org_id);

ALTER TABLE schemaa."officeEmployees" ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'default-org';
CREATE INDEX IF NOT EXISTS idx_officeEmployees_org_id ON schemaa."officeEmployees" (org_id);

ALTER TABLE schemaa."officeGpsDevices" ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'default-org';
CREATE INDEX IF NOT EXISTS idx_officeGpsDevices_org_id ON schemaa."officeGpsDevices" (org_id);

ALTER TABLE schemaa."officePermissions" ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'default-org';
CREATE INDEX IF NOT EXISTS idx_officePermissions_org_id ON schemaa."officePermissions" (org_id);

ALTER TABLE schemaa."officeRolePermissions" ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'default-org';
CREATE INDEX IF NOT EXISTS idx_officeRolePermissions_org_id ON schemaa."officeRolePermissions" (org_id);

ALTER TABLE schemaa."officeRoles" ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'default-org';
CREATE INDEX IF NOT EXISTS idx_officeRoles_org_id ON schemaa."officeRoles" (org_id);

ALTER TABLE schemaa."officeVehicles" ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'default-org';
CREATE INDEX IF NOT EXISTS idx_officeVehicles_org_id ON schemaa."officeVehicles" (org_id);

-- Verification: Show org_id column status for all office* tables
SELECT t.table_name, 
       CASE WHEN c.column_name = 'org_id' THEN 'YES' ELSE 'NO' END as has_org_id,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'schemaa' AND table_name = t.table_name) as total_columns
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_schema = c.table_schema 
                                        AND t.table_name = c.table_name 
                                        AND c.column_name = 'org_id'
WHERE t.table_schema = 'schemaa' 
  AND t.table_name LIKE 'office%'
ORDER BY t.table_name;