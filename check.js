const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT "id", "craftType", "advancePaid", "fairWageFloor" FROM "CraftItem" WHERE "craftType" ILIKE \'%Sambalpuri%\'');
  console.log(res.rows);
  await client.end();
}
main();
