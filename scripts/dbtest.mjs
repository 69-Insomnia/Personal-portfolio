import pg from 'pg';

const url = 'postgresql://postgres:Guragain%40%401234@db.dxhkehmjuwgithhpgsxe.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  const v = await client.query('select version()');
  console.log('CONNECTED:', v.rows[0].version.slice(0, 60));

  const schemas = await client.query(
    "select schema_name from information_schema.schemata where schema_name not in ('pg_catalog','information_schema') order by 1"
  );
  console.log('SCHEMAS:', schemas.rows.map((r) => r.schema_name).join(', '));

  // look for tables that might hold API keys
  const keys = await client.query(
    "select table_schema, table_name from information_schema.tables where table_name ilike '%key%' or table_name ilike '%token%' order by 1,2"
  );
  console.log('KEYISH TABLES:', keys.rows.map((r) => `${r.table_schema}.${r.table_name}`).join(', '));
} catch (e) {
  console.error('FAIL:', e.message);
} finally {
  await client.end();
}
