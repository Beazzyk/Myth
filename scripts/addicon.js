require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Absolute path to .env
const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addIconToItem(itemId, iconPath) {
  try {
    const fileContent = fs.readFileSync(iconPath);
    const query = `
      UPDATE items
      SET icon = $1
      WHERE id = $2
    `;
    await pool.query(query, [fileContent, itemId]);
    console.log(`Icon added to item ${itemId}`);
  } catch (error) {
    console.error(`Error adding icon to item ${itemId}:`, error);
  } finally {
    await pool.end();
  }
}

const iconPath = path.join(__dirname, './images/items/sword_of_zeus.png');
addIconToItem(1, iconPath); // 
