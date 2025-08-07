"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, ArrowLeft, Activity, Calendar, TrendingUp, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { getUserById, getSugarReadings, getUserStats } from "@/lib/neon"
import { SugarChart } from "@/components/sugar-chart"

interface UserProfile {
  id: number
  email: string
  name: string
  profile_image_url: string | null
  created_at: string | Date
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

export default function AdminUserDetailPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [readings, setReadings] = useState<SugarReading[]>([])
  const [stats, setStats] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const userId = Number(params.id)

  useEffect(() => {
    // Check admin authentication
    const adminSession = localStorage.getItem("adminSession")
    const userRole = localStorage.getItem("userRole")

    if (!adminSession || userRole !== "admin") {
      router.push("/admin-login")
      return
    }

    if (userId) {
      fetchUserData(userId)
    }
  }, [router, userId])

  const fetchUserData = async (id: number) => {
    setLoading(true)
    setError("")
    try {
      const [userData, readingsData, statsData] = await Promise.all([
        getUserById(id),
        getSugarReadings(id, 100),
        getUserStats(id, 30),
      ])

      setUser(userData as UserProfile)
      setReadings((readingsData as any[]).map(r => ({
        ...r,
        reading_date: typeof r.reading_date === 'string' ? r.reading_date : new Date(r.reading_date).toISOString().split('T')[0],
        reading_time: typeof r.reading_time === 'string' ? r.reading_time : new Date(r.reading_time).toTimeString().slice(0,5),
      })) as SugarReading[])
      setStats(statsData as UserStats[])
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to fetch user data.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateValue: string | Date) => {
    try {
      if (typeof dateValue === "string") {
        return dateValue
      } else if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0]
      } else {
        return "Invalid Date"
      }
    } catch (error) {
      return "Invalid Date"
    }
  }

  const formatTime = (timeValue: string | Date) => {
    try {
      let dateObj: Date
      if (typeof timeValue === "string") {
        // If it's a string, create a Date object using today's date and the time string
        const today = new Date()
        const [hours, minutes] = timeValue.split(":")
        dateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate(), Number(hours), Number(minutes))
      } else if (timeValue instanceof Date) {
        dateObj = timeValue
      } else {
        return "Invalid Time"
      }
      // Format to 12-hour with AM/PM
      return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    } catch (error) {
      return "Invalid Time"
    }
  }

  const getStatusColor = (level: number, type: string) => {
    if (type === "fasting") {
      if (level >= 70 && level <= 100) return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
      if (level > 100) return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
    } else {
      if (level < 140) return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
      if (level >= 140 && level < 200) return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
    }
  }

  const getStatus = (level: number, type: string) => {
    if (type === "fasting") {
      if (level >= 70 && level <= 100) return "normal"
      if (level > 100) return "high"
      return "low"
    } else {
      if (level < 140) return "normal"
      if (level >= 140 && level < 200) return "elevated"
      return "high"
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
        ease: "easeOut" as const,
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "User not found"}</p>
          <Link href="/admin">
            <Button>Back to Admin Panel</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-red-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 p-2 sm:p-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Back</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">User Details - </span>{user.name}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
      >
        {/* User Profile Card */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>User Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {user.profile_image_url ? (
                  <Image
                    src={user.profile_image_url || "/placeholder.svg"}
                    alt={user.name}
                    width={80}
                    height={80}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-red-200"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{user.name}</h2>
                  <p className="text-red-600 text-base sm:text-lg">{user.email}</p>
                  <p className="text-gray-600 text-sm sm:text-base">Member since: {formatDate(user.created_at)}</p>
                  <div className="mt-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm">
                      {readings.length} total readings
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-700 text-sm sm:text-base">Total Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-800">{readings.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-700 text-sm sm:text-base">Avg Fasting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-800">
                {stats.find((s) => s.reading_type === "fasting")?.avg_level
                  ? Math.round(Number(stats.find((s) => s.reading_type === "fasting")?.avg_level))
                  : "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-700 text-sm sm:text-base">Avg Random</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-800">
                {stats.find((s) => s.reading_type === "random")?.avg_level
                  ? Math.round(Number(stats.find((s) => s.reading_type === "random")?.avg_level))
                  : "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-700 text-sm sm:text-base">Last 30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-800">
                {
                  readings.filter((r) => {
                    const readingDate = new Date(r.reading_date)
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return readingDate >= thirtyDaysAgo
                  }).length
                }
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chart */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Blood Sugar Trends</span>
              </CardTitle>
              <CardDescription className="text-sm">User's readings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[300px]">
                  <SugarChart readings={readings} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Readings Table */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800 text-base sm:text-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>All Readings</span>
              </CardTitle>
              <CardDescription className="text-sm">Complete reading history for this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-[80px] sm:w-auto">Date</th>
                      <th className="text-left py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-[60px] sm:w-auto">Time</th>
                      <th className="text-left py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-[70px] sm:w-auto">Type</th>
                      <th className="text-left py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-[80px] sm:w-auto">Level</th>
                      <th className="text-left py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-[70px] sm:w-auto">Status</th>
                      <th className="text-left py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-semibold text-gray-700 text-xs sm:text-sm w-[100px] sm:w-auto">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((reading) => (
                      <tr key={reading.id} className="border-b border-gray-100 hover:bg-red-50/50 transition-colors">
                        <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4 text-gray-800 text-xs sm:text-sm">
                          <div className="whitespace-nowrap">
                            {formatDate(reading.reading_date)}
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4 text-gray-600 text-xs sm:text-sm">
                          <div className="whitespace-nowrap">
                            {formatTime(reading.reading_time)}
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4">
                          <Badge variant="outline" className="border-red-200 text-red-700 capitalize text-xs whitespace-nowrap">
                            {reading.reading_type}
                          </Badge>
                        </td>
                        <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4">
                          <div className="whitespace-nowrap">
                            <span className="font-semibold text-gray-800 text-xs sm:text-sm">{reading.sugar_level}</span>
                            <span className="text-gray-500 text-xs ml-1">mg/dL</span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4">
                          <Badge className={`${getStatusColor(reading.sugar_level, reading.reading_type)} text-xs whitespace-nowrap`}>
                            {getStatus(reading.sugar_level, reading.reading_type)}
                          </Badge>
                        </td>
                        <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4 text-gray-600 text-xs sm:text-sm">
                          <div className="max-w-[80px] sm:max-w-[120px] lg:max-w-[200px] truncate" title={reading.notes || ""}>
                            {reading.notes || "No notes"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {readings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No readings found for this user.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
