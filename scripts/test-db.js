const { neon } = require("@neondatabase/serverless");

const DATABASE_URL = "postgresql://neondb_owner:npg_xNmcl2OJse7k@ep-lively-shape-a1um47m7-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function testConnection() {
  try {
    const sql = neon(DATABASE_URL);
    console.log("Testing database connection...");
    
    const result = await sql`SELECT NOW() as current_time`;
    console.log("✅ Database connected successfully:", result[0]);
    
    // Test a simple query
    const users = await sql`SELECT COUNT(*) as user_count FROM users`;
    console.log("✅ Users table accessible:", users[0]);
    
    const readings = await sql`SELECT COUNT(*) as reading_count FROM sugar_readings`;
    console.log("✅ Sugar readings table accessible:", readings[0]);
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Full error:", error);
  }
}

testConnection(); 