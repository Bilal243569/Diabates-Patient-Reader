"use server"

import { testConnection } from "@/lib/neon"

export async function testDatabaseConnection() {
  try {
    const result = await testConnection()
    return result
  } catch (error) {
    console.error("Test connection error:", error)
    return { success: false, error: "Failed to test database connection" }
  }
} 