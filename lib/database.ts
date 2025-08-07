import { sql } from "@/lib/neon"

// User operations with real data
export async function getUsers() {
  try {
    const result = await sql`
      SELECT id, email, name, profile_image_url, created_at
      FROM users
      ORDER BY created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
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
    console.error("Error fetching user:", error)
    return null
  }
}

// Sugar readings with real data
export async function getSugarReadings(userId?: number, limit = 50) {
  try {
    if (userId) {
      const result = await sql`
        SELECT sr.*, u.name as user_name
        FROM sugar_readings sr
        JOIN users u ON sr.user_id = u.id
        WHERE sr.user_id = ${userId}
        ORDER BY sr.reading_date DESC, sr.reading_time DESC
        LIMIT ${limit}
      `
      return result
    } else {
      const result = await sql`
        SELECT sr.*, u.name as user_name
        FROM sugar_readings sr
        JOIN users u ON sr.user_id = u.id
        ORDER BY sr.reading_date DESC, sr.reading_time DESC
        LIMIT ${limit}
      `
      return result
    }
  } catch (error) {
    console.error("Error fetching sugar readings:", error)
    return []
  }
}

export async function getReadingStats(userId: number) {
  try {
    const result = await sql`
      SELECT 
        reading_type,
        AVG(sugar_level)::NUMERIC(5,1) as avg_level,
        COUNT(*) as reading_count,
        MIN(sugar_level) as min_level,
        MAX(sugar_level) as max_level
      FROM sugar_readings
      WHERE user_id = ${userId}
      AND reading_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY reading_type
      ORDER BY reading_type
    `
    return result
  } catch (error) {
    console.error("Error fetching reading stats:", error)
    return []
  }
}

// Reminders with real data
export async function getReminders(userId?: number) {
  try {
    if (userId) {
      const result = await sql`
        SELECT r.*, u.name as user_name
        FROM reminders r
        JOIN users u ON r.user_id = u.id
        WHERE r.user_id = ${userId}
        ORDER BY r.reminder_time
      `
      return result
    } else {
      const result = await sql`
        SELECT r.*, u.name as user_name
        FROM reminders r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.user_id, r.reminder_time
      `
      return result
    }
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return []
  }
}

// Shared reports with real data
export async function getSharedReports(userId?: number) {
  try {
    if (userId) {
      const result = await sql`
        SELECT sr.*, u.name as user_name
        FROM shared_reports sr
        JOIN users u ON sr.user_id = u.id
        WHERE sr.user_id = ${userId}
        ORDER BY sr.created_at DESC
      `
      return result
    } else {
      const result = await sql`
        SELECT sr.*, u.name as user_name
        FROM shared_reports sr
        JOIN users u ON sr.user_id = u.id
        ORDER BY sr.created_at DESC
      `
      return result
    }
  } catch (error) {
    console.error("Error fetching shared reports:", error)
    return []
  }
}

// Chart data for dashboard
export async function getChartData(userId: number, days = 30) {
  try {
    // Calculate the start date in JavaScript
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateString = startDate.toISOString().split("T")[0] // Format as YYYY-MM-DD

    const result = await sql`
      SELECT 
        reading_date,
        reading_type,
        AVG(sugar_level)::NUMERIC(5,1) as avg_level
      FROM sugar_readings
      WHERE user_id = ${userId}
      AND reading_date >= ${startDateString}
      GROUP BY reading_date, reading_type
      ORDER BY reading_date ASC
    `
    return result
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return []
  }
}
