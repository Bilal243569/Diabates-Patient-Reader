import { neon } from "@neondatabase/serverless"

// Use environment variable for database URL
const DATABASE_URL = process.env.DATABASE_URL || 
  "postgresql://neondb_owner:npg_xNmcl2OJse7k@ep-lively-shape-a1um47m7-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

// Create a more robust connection
export const sql = neon(DATABASE_URL)

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`
    console.log("Database connected successfully:", result[0])
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Database connection failed:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// User operations
export async function createUser(email: string, name: string, passwordHash: string, profileImageUrl?: string) {
  try {
    const result = await sql`
      INSERT INTO users (email, name, password_hash, profile_image_url)
      VALUES (${email}, ${name}, ${passwordHash}, ${profileImageUrl})
      RETURNING id, email, name, profile_image_url, created_at
    `
    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, email, name, password_hash, profile_image_url, created_at
      FROM users
      WHERE email = ${email}
    `
    return result[0]
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: number) {
  try {
    const result = await sql`
      SELECT id, email, name, profile_image_url, created_at
      FROM users
      WHERE id = ${id}
    `
    return result[0]
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Get all users for database display
export async function getAllUsers() {
  try {
    const result = await sql`
      SELECT id, email, name, profile_image_url, created_at
      FROM users
      ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error getting all users:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
    }
    return []
  }
}

// Sugar reading operations
export async function createSugarReading(
  userId: number,
  readingType: string,
  sugarLevel: number,
  readingDate: string,
  readingTime: string,
  notes?: string,
) {
  try {
    // Calculate day name in Asia/Karachi timezone
    const [year, month, day] = readingDate.split("-");
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Karachi" });

    const result = await sql`
      INSERT INTO sugar_readings (user_id, reading_type, sugar_level, reading_date, reading_time, notes, day)
      VALUES (${userId}, ${readingType}, ${sugarLevel}, ${readingDate}, ${readingTime}, ${notes}, ${dayName})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating sugar reading:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
    }
    throw new Error(`Failed to create sugar reading: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getSugarReadings(userId?: number, limit = 50) {
  try {
    if (userId) {
      const result = await sql`
        SELECT sr.*, u.name as user_name, u.profile_image_url
        FROM sugar_readings sr
        JOIN users u ON sr.user_id = u.id
        WHERE sr.user_id = ${userId}
        ORDER BY sr.reading_date DESC, sr.reading_time DESC
        LIMIT ${limit}
      `
      return result
    } else {
      const result = await sql`
        SELECT sr.*, u.name as user_name, u.profile_image_url
        FROM sugar_readings sr
        JOIN users u ON sr.user_id = u.id
        ORDER BY sr.reading_date DESC, sr.reading_time DESC
        LIMIT ${limit}
      `
      return result
    }
  } catch (error) {
    console.error("Error getting sugar readings:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
    }
    return []
  }
}

// Get all reminders
export async function getAllReminders() {
  try {
    const result = await sql`
      SELECT r.*, u.name as user_name, u.profile_image_url
      FROM reminders r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.user_id, r.reminder_time
    `
    return result
  } catch (error) {
    console.error("Error getting reminders:", error)
    return []
  }
}

// Get all shared reports
export async function getAllSharedReports() {
  try {
    const result = await sql`
      SELECT sr.*, u.name as user_name, u.profile_image_url
      FROM shared_reports sr
      JOIN users u ON sr.user_id = u.id
      ORDER BY sr.created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error getting shared reports:", error)
    return []
  }
}

// Statistics
export async function getUserStats(userId: number, days = 30) {
  try {
    // Calculate the start date in JavaScript
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateString = startDate.toISOString().split("T")[0] // Format as YYYY-MM-DD

    const result = await sql`
      SELECT 
        reading_type,
        AVG(sugar_level)::NUMERIC(5,1) as avg_level,
        COUNT(*) as reading_count,
        MIN(sugar_level) as min_level,
        MAX(sugar_level) as max_level
      FROM sugar_readings
      WHERE user_id = ${userId}
      AND reading_date >= ${startDateString}
      GROUP BY reading_type
    `
    return result
  } catch (error) {
    console.error("Error getting user stats:", error)
    return []
  }
}
