-- Adds org_id to all base tables in schemaa if missing.
-- This script is SAFE to run multiple times.
-- NOTE: This file is created only; no DB operation is executed by the code assistant.

DO $$
DECLARE
    r RECORD;
    idx_name TEXT;
BEGIN
    FOR r IN
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_schema = 'schemaa'
          AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS org_id TEXT',
            r.table_schema,
            r.table_name
        );

        idx_name := format('idx_%s_org_id', substr(md5(r.table_schema || '_' || r.table_name), 1, 16));

        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS %I ON %I.%I (org_id)',
            idx_name,
            r.table_schema,
            r.table_name
        );
    END LOOP;
END
$$;

-- Optional hardening after backfill:
-- ALTER TABLE schemaa."officeEmployees" ALTER COLUMN org_id SET NOT NULL;
-- ALTER TABLE schemaa."officeVehicles" ALTER COLUMN org_id SET NOT NULL;
-- ALTER TABLE schemaa."officeDrivers" ALTER COLUMN org_id SET NOT NULL;
