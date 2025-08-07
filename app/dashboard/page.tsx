"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Plus, TrendingUp, Calendar, Share2, Download, User } from "lucide-react"
import Link from "next/link"
import { SugarChart } from "@/components/sugar-chart"
import { RecentReadings } from "@/components/recent-readings"
import { StatsCards } from "@/components/stats-cards"
import { UserDropdown } from "@/components/user-dropdown"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { getUserSession } from "@/lib/session"
import { getSugarReadings, getUserStats, testConnection } from "@/lib/neon"

interface UserSession {
  id: number
  name: string
  email: string
  profile_image_url: string | null
  role: string
}

interface SugarReading {
  id: number
  reading_type: string
  sugar_level: number
  reading_date: string
  reading_time: string
  notes: string | null
}

interface UserStats {
  reading_type: string
  avg_level: number
  reading_count: number
  min_level: number
  max_level: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [recentReadings, setRecentReadings] = useState<SugarReading[]>([])
  const [chartReadings, setChartReadings] = useState<SugarReading[]>([])
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getUserSession()
    if (!session) {
      router.push("/login")
      return
    }
    setUserSession(session)
    fetchDashboardData(session.id)

    // Refresh data every 30 seconds to ensure live updates
    const interval = setInterval(() => {
      fetchDashboardData(session.id)
    }, 30000)

    return () => clearInterval(interval)
  }, [router])

  const fetchDashboardData = async (userId: number) => {
    setLoading(true)
    try {
      // Test database connection first
      const dbConnected = await testConnection()
      console.log("Database connection:", dbConnected ? "✅ Connected" : "❌ Failed")

      // Fetch user-specific readings and stats
      const [recentReadingsData, chartReadingsData, stats] = await Promise.all([
        getSugarReadings(userId, 10).catch((err) => {
          console.error("Error fetching recent readings:", err)
          return []
        }),
        getSugarReadings(userId, 50).catch((err) => {
          console.error("Error fetching chart readings:", err)
          return []
        }),
        getUserStats(userId, 30).catch((err) => {
          console.error("Error fetching stats:", err)
          return []
        }),
      ])

      // Process the data to ensure proper format
      const processedRecentReadings = (recentReadingsData as any[]).map(r => ({
        ...r,
        reading_date: typeof r.reading_date === 'string' ? r.reading_date : new Date(r.reading_date).toISOString().split('T')[0],
        reading_time: typeof r.reading_time === 'string' ? r.reading_time : new Date(r.reading_time).toTimeString().slice(0,5),
      })) as SugarReading[]

      const processedChartReadings = (chartReadingsData as any[]).map(r => ({
        ...r,
        reading_date: typeof r.reading_date === 'string' ? r.reading_date : new Date(r.reading_date).toISOString().split('T')[0],
        reading_time: typeof r.reading_time === 'string' ? r.reading_time : new Date(r.reading_time).toTimeString().slice(0,5),
      })) as SugarReading[]

      console.log("Dashboard Data:", {
        userId,
        recentReadingsCount: processedRecentReadings.length,
        chartReadingsCount: processedChartReadings.length,
        statsCount: stats.length,
        sampleReading: processedChartReadings[0]
      })

      setRecentReadings(processedRecentReadings)
      setChartReadings(processedChartReadings)
      setUserStats(stats as UserStats[])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Set fallback data
      setRecentReadings([])
      setChartReadings([])
      setUserStats([])
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
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
          <p className="text-gray-600">Loading dashboard...</p>
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
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl hidden sm:block">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                DiabetesTracker
              </h1>
            </motion.div>

            {/* Desktop Header Actions */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
              <Link href="/add-reading">
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Add Reading</span>
                  <span className="lg:hidden">Add</span>
                </Button>
              </Link>
              </motion.div>
              {userSession && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <UserDropdown />
                </motion.div>
              )}
            </div>

            {/* Mobile Header Actions */}
            <div className="flex sm:hidden items-center space-x-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
              <Link href="/add-reading">
                <Button
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg text-xs"
                  size="sm"
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Reading
                </Button>
              </Link>
              </motion.div>
              {userSession && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <UserDropdown />
                </motion.div>
              )}
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
          className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8"
      >
        {/* Welcome Section */}
          <motion.div 
            variants={fadeInUpVariants}
            className="mb-4 sm:mb-6 lg:mb-8"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Welcome back, {userSession?.name || "User"}! 👋
          </h2>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Here's your diabetes tracking overview for today</p>
        </motion.div>

        {/* Stats Cards with Real User Data */}
          <motion.div variants={fadeInUpVariants}>
          <StatsCards stats={userStats} />
        </motion.div>

        {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 lg:mt-8">
          {/* Chart Section with Real User Data */}
            <motion.div variants={slideInVariants} className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 p-4 sm:p-6">
                <div>
                    <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-800">Blood Sugar Trends</CardTitle>
                    <CardDescription className="text-gray-600 text-xs sm:text-sm">Your readings over the past 30 days</CardDescription>
                </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto">
                  <Link href="/calendar">
                    <Button
                      variant="outline"
                      size="sm"
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent text-xs h-8"
                    >
                        <Calendar className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Calendar</span>
                      <span className="sm:hidden">Cal</span>
                    </Button>
                  </Link>
                  <Link href="/history">
                    <Button
                      variant="outline"
                      size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent text-xs h-8"
                    >
                        <Download className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Download</span>
                      <span className="sm:hidden">DL</span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                      className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent text-xs h-8"
                  >
                      <Share2 className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Share</span>
                    <span className="sm:hidden">Share</span>
                  </Button>
                </div>
              </CardHeader>
                <CardContent className="p-4 sm:p-6">
                <SugarChart readings={chartReadings} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Readings with Real User Data */}
            <motion.div variants={slideInVariants}>
            <RecentReadings readings={recentReadings} />
          </motion.div>
        </div>

        {/* Quick Actions */}
          <motion.div variants={fadeInUpVariants} className="mt-4 sm:mt-6 lg:mt-8">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-800">Quick Actions</CardTitle>
                <CardDescription className="text-gray-600 text-xs sm:text-sm">Common tasks and features</CardDescription>
            </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                <Link href="/add-reading">
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-14 sm:h-16 lg:h-20 flex flex-col bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200 hover:from-emerald-100 hover:to-teal-200"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 mb-1 sm:mb-2 text-emerald-600" />
                      <span className="text-emerald-700 font-medium text-xs sm:text-sm">Add Reading</span>
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/history">
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-14 sm:h-16 lg:h-20 flex flex-col bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200"
                      >
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 mb-1 sm:mb-2 text-blue-600" />
                      <span className="text-blue-700 font-medium text-xs sm:text-sm">View History</span>
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/calendar">
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <Button
                        variant="outline"
                          className="justify-center items-center w-full h-14 sm:h-16 lg:h-20 flex flex-col bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200"
                        >
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 mb-1 sm:mb-2 text-purple-600" />
                      <span className="text-purple-700 font-medium text-xs sm:text-sm">Calendar</span>
                    </Button>
                  </motion.div>
                </Link>
                {/* <Link href="/database">
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-14 sm:h-16 lg:h-20 flex flex-col bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200"
                      >
                        <User className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 mb-1 sm:mb-2 text-orange-600" />
                      <span className="text-orange-700 font-medium text-xs sm:text-sm">Database</span>
                    </Button>
                  </motion.div>
                </Link> */}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      </div>
    </div>
  )
}
