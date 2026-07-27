-- Paste this in Supabase SQL Editor and click Run.
-- If the result is empty, no tables were created yet.

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
