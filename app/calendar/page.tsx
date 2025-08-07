"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getSugarReadings } from "@/lib/neon"

interface SugarReading {
  id: number
  reading_type: string
  sugar_level: number
  reading_date: string
  reading_time: string
  notes: string | null
}

export default function CalendarPage() {
  const [readings, setReadings] = useState<SugarReading[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchReadings()
  }, [])

  const fetchReadings = async () => {
    setLoading(true)
    try {
      // In a real app, get user ID from session/auth context
      const userId = 1 // For demo purposes
      const readingsData = await getSugarReadings(userId, 100) // Get last 100 readings
      setReadings(readingsData as SugarReading[])
    } catch (error) {
      console.error("Error fetching readings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getReadingsForDate = (date: Date | null) => {
    if (!date) return []
    const dateString = date.toISOString().split("T")[0]
    return readings.filter((reading) => reading.reading_date === dateString)
  }

  const getAverageLevel = (dayReadings: SugarReading[]) => {
    if (dayReadings.length === 0) return null
    const sum = dayReadings.reduce((acc, reading) => acc + reading.sugar_level, 0)
    return Math.round(sum / dayReadings.length)
  }

  const getStatusColor = (avgLevel: number | null) => {
    if (!avgLevel) return ""
    if (avgLevel >= 70 && avgLevel <= 140) return "bg-green-100 border-green-300"
    if (avgLevel > 140) return "bg-red-100 border-red-300"
    return "bg-yellow-100 border-yellow-300"
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.42, 0, 1, 1] as [number, number, number, number],
      },
    },
  }

  const slideInVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.42, 0, 1, 1] as [number, number, number, number],
      },
    },
  }

  const fadeInUpVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.42, 0, 1, 1] as [number, number, number, number],
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading calendar...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Fixed Header for Mobile */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.42, 0, 1, 1] as [number, number, number, number] }}
        className="bg-white/95 backdrop-blur-md shadow-lg border-b border-purple-100 fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50 text-xs sm:text-sm">
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                </Link>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex items-center space-x-2 sm:space-x-3"
              >
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg sm:rounded-xl shadow-lg">
                  <CalendarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Reading Calendar
                </h1>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content with Top Padding for Fixed Header */}
      <div className="pt-14 sm:pt-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
        >
          {/* Calendar */}
          <motion.div variants={slideInVariants}>
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-gray-800">Blood Sugar Calendar</CardTitle>
                    <CardDescription className="text-gray-600 text-sm sm:text-base">
                      View your readings by date - colors indicate average levels
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 text-xs h-8 sm:h-9"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 min-w-[120px] sm:min-w-[200px] text-center">{monthYear}</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 text-xs h-8 sm:h-9"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-600 py-1 sm:py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {days.map((date, index) => {
                    const dayReadings = getReadingsForDate(date)
                    const avgLevel = getAverageLevel(dayReadings)
                    const isToday = date && date.toDateString() === new Date().toDateString()

                    return (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className={`
                          min-h-[56px] sm:min-h-[80px] p-1 sm:p-2 border-2 rounded-lg transition-all duration-200 hover:shadow-md
                          ${date ? "cursor-pointer" : ""}
                          ${isToday ? "ring-2 ring-purple-400" : ""}
                          ${avgLevel ? getStatusColor(avgLevel) : "bg-gray-50 border-gray-200"}
                          ${!date ? "border-transparent" : ""}
                        `}
                      >
                        {date && (
                          <>
                            <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                              <span className={`text-xs sm:text-sm font-medium ${isToday ? "text-purple-700" : "text-gray-700"}`}>
                                {date.getDate()}
                              </span>
                              {dayReadings.length > 0 && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs px-1 py-0">
                                  {dayReadings.length}
                                </Badge>
                              )}
                            </div>
                            {avgLevel && <div className="text-[10px] sm:text-xs text-gray-600">Avg: {avgLevel} mg/dL</div>}
                            {dayReadings.length > 0 && (
                              <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                                {dayReadings.slice(0, 2).map((reading, idx) => (
                                  <div key={idx} className="text-[10px] sm:text-xs text-gray-500 truncate">
                                    {reading.reading_time.slice(0, 5)} - {reading.sugar_level}
                                  </div>
                                ))}
                                {dayReadings.length > 2 && (
                                  <div className="text-[10px] sm:text-xs text-gray-400">+{dayReadings.length - 2} more</div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                    <span className="text-gray-600">Normal (70-140 mg/dL)</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                    <span className="text-gray-600">Low (&lt;70 mg/dL)</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                    <span className="text-gray-600">High (&gt;140 mg/dL)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Summary */}
          <motion.div variants={fadeInUpVariants} className="mt-4 sm:mt-6 lg:mt-8">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-gray-800">Monthly Summary</CardTitle>
                <CardDescription className="text-gray-600 text-sm sm:text-base">Overview of your readings for {monthYear}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                      {
                        readings.filter((r) => {
                          const readingDate = new Date(r.reading_date)
                          return (
                            readingDate.getMonth() === currentDate.getMonth() &&
                            readingDate.getFullYear() === currentDate.getFullYear()
                          )
                        }).length
                      }
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Total Readings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                      {
                        readings.filter((r) => {
                          const readingDate = new Date(r.reading_date)
                          const inMonth =
                            readingDate.getMonth() === currentDate.getMonth() &&
                            readingDate.getFullYear() === currentDate.getFullYear()
                          const isNormal =
                            (r.reading_type === "fasting" && r.sugar_level >= 70 && r.sugar_level <= 100) ||
                            (r.reading_type !== "fasting" && r.sugar_level < 140)
                          return inMonth && isNormal
                        }).length
                      }
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Normal Readings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">
                      {
                        readings.filter((r) => {
                          const readingDate = new Date(r.reading_date)
                          const inMonth =
                            readingDate.getMonth() === currentDate.getMonth() &&
                            readingDate.getFullYear() === currentDate.getFullYear()
                          const isHigh = r.sugar_level > 140
                          return inMonth && isHigh
                        }).length
                      }
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">High Readings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                      {
                        new Set(
                          readings
                            .filter((r) => {
                              const readingDate = new Date(r.reading_date)
                              return (
                                readingDate.getMonth() === currentDate.getMonth() &&
                                readingDate.getFullYear() === currentDate.getFullYear()
                              )
                            })
                            .map((r) => r.reading_date),
                        ).size
                      }
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Days Tracked</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
