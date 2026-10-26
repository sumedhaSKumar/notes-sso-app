const fs = require('node:fs');

const path = require('node:path');

const db = require('./index');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  await db.query(sql);

  console.log('Schema applied');
}

migrate()
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
