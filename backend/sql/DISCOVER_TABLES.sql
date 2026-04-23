-- DIAGNOSTIC: Find all tables in the database

-- List all tables in schemaa schema
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'schemaa' 
ORDER BY table_name;

-- List all tables in public schema
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- List all schemas
SELECT schema_name 
FROM information_schema.schemata 
ORDER BY schema_name;
