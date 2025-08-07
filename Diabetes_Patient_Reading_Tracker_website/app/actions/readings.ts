"use server"

import { createSugarReading, getSugarReadings, getUserStats } from "@/lib/neon"

export async function addReadingAction(formData: FormData) {
  const userId = Number(formData.get("userId"))
  const readingType = formData.get("type") as string
  const sugarLevel = Number.parseInt(formData.get("level") as string)
  const readingDate = formData.get("date") as string
  const readingTime = formData.get("time") as string
  const notes = formData.get("notes") as string

  if (!userId || !readingType || !sugarLevel || !readingDate || !readingTime) {
    return { error: "All required fields must be filled" }
  }

  if (sugarLevel < 50 || sugarLevel > 500) {
    return { error: "Sugar level must be between 50 and 500 mg/dL" }
  }

  try {
    const reading = await createSugarReading(userId, readingType, sugarLevel, readingDate, readingTime, notes || undefined)

    return { success: true, reading }
  } catch (error) {
    console.error("Add reading error:", error)
    return { error: "Failed to save reading" }
  }
}

export async function getReadingsAction(userId: number, limit = 50) {
  try {
    const readings = await getSugarReadings(userId, limit)
    return { success: true, readings }
  } catch (error) {
    console.error("Get readings error:", error)
    return { error: "Failed to fetch readings" }
  }
}

export async function getStatsAction(userId: number, days = 30) {
  try {
    const stats = await getUserStats(userId, days)
    return { success: true, stats }
  } catch (error) {
    console.error("Get stats error:", error)
    return { error: "Failed to fetch statistics" }
  }
}
