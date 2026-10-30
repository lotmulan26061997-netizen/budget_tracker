// scripts/migrate.js
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Usage: node scripts/migrate.js <DATABASE_URL>");
  process.exit(1);
}

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log("Executing sql/schema.sql migration...");
    await client.query(sql);
    console.log("Migration executed successfully!");

    // Verify tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("Tables in public schema:", res.rows.map(r => r.table_name));

  } catch (err) {
    console.error("Database migration error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

