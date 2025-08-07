const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_uXdR2h5MKyDb@ep-summer-salad-a1k4r81h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

async function addDayColumn() {
  try {
    await sql.query('ALTER TABLE sugar_readings ADD COLUMN day VARCHAR(20);');
    console.log("✅ 'day' column added to sugar_readings table.");
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log("'day' column already exists.");
    } else {
      console.error('❌ Error adding day column:', error);
    }
  }
}

addDayColumn(); 