"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, ArrowLeft, Users, Activity, RefreshCw, LogOut, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getAllUsers, getSugarReadings } from "@/lib/neon"

interface User {
  id: number
  email: string
  name: string
  profile_image_url: string | null
  created_at: string | Date
}

interface SugarReading {
  id: number
  user_id: number
  user_name: string
  profile_image_url: string | null
  reading_type: string
  sugar_level: number
  reading_date: string | Date
  reading_time: string | Date
  notes: string | null
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [readings, setReadings] = useState<SugarReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication
    const adminSession = localStorage.getItem("adminSession")
    const userRole = localStorage.getItem("userRole")

    if (!adminSession || userRole !== "admin") {
      router.push("/admin-login")
      return
    }

    fetchAdminData()
  }, [router])

  const fetchAdminData = async () => {
    setLoading(true)
    setError("")
    try {
      const [usersData, readingsData] = await Promise.all([getAllUsers(), getSugarReadings()])

      setUsers(usersData as User[])
      setReadings(readingsData as SugarReading[])
    } catch (error) {
      console.error("Error fetching admin data:", error)
      setError("Failed to fetch data. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    localStorage.removeItem("userRole")
    router.push("/")
  }

  const handleBackClick = () => {
    setShowLogoutModal(true)
  }

  const formatDate = (dateValue: string | Date) => {
    try {
      if (typeof dateValue === "string") {
        return new Date(dateValue).toLocaleDateString()
      } else if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString()
      } else {
        return "Invalid Date"
      }
    } catch (error) {
      return "Invalid Date"
    }
  }

  const getUserReadingsCount = (userId: number) => {
    return readings.filter((reading) => reading.user_id === userId).length
  }

  const getUserLatestReading = (userId: number) => {
    const userReadings = readings.filter((reading) => reading.user_id === userId)
    if (userReadings.length === 0) return null
    return userReadings.sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())[0]
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

  const modalVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
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
              {/* <Button
                onClick={handleBackClick}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 p-2 sm:p-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Back</span>
              </Button> */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                onClick={fetchAdminData}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent p-2 sm:p-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent p-2 sm:p-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
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
        {error && (
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Admin Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-red-700 text-sm sm:text-base">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Total Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-red-800">{users.length}</div>
              <p className="text-xs sm:text-sm text-red-600">Registered patients</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-blue-700 text-sm sm:text-base">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Total Readings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-800">{readings.length}</div>
              <p className="text-xs sm:text-sm text-blue-600">Sugar measurements</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-green-700 text-sm sm:text-base">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Active Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-800">
                {users.filter((user) => getUserReadingsCount(user.id) > 0).length}
              </div>
              <p className="text-xs sm:text-sm text-green-600">Users with readings</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-orange-700 text-sm sm:text-base">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Avg Readings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-800">
                {users.length > 0 ? Math.round(readings.length / users.length) : 0}
              </div>
              <p className="text-xs sm:text-sm text-orange-600">Per user</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Management */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Complete user profiles with reading statistics (Click email to view details)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">ID</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Profile</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Name</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Email</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Readings</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm hidden sm:table-cell">Latest Reading</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm hidden lg:table-cell">Joined</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const readingsCount = getUserReadingsCount(user.id)
                      const latestReading = getUserLatestReading(user.id)

                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-b border-gray-100 hover:bg-red-50/50 transition-colors"
                        >
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-mono text-xs sm:text-sm font-semibold text-red-600">{user.id}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            {user.profile_image_url ? (
                              <Image
                                src={user.profile_image_url || "/placeholder.svg"}
                                alt={user.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-200"
                              />
                            ) : (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                              </div>
                            )}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-800 text-xs sm:text-sm">
                            <span className="truncate block max-w-[80px] sm:max-w-none">{user.name}</span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <Link href={`/admin/user/${user.id}`}>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-red-600 hover:text-red-800 hover:underline font-medium text-xs sm:text-sm"
                              >
                                <span className="truncate block max-w-[100px] sm:max-w-none">{user.email}</span>
                              </Button>
                            </Link>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                              {readingsCount}
                            </Badge>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                            {latestReading ? (
                              <div className="text-xs sm:text-sm">
                                <div className="font-semibold">{latestReading.sugar_level} mg/dL</div>
                                <div className="text-gray-500">{formatDate(latestReading.reading_date)}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">No readings</span>
                            )}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs hidden lg:table-cell">{formatDate(user.created_at)}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <Badge
                              className={
                                readingsCount > 0
                                  ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200 text-xs"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 text-xs"
                              }
                            >
                              {readingsCount > 0 ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
                {users.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No users found in database.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 p-4">
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl shadow-xl p-6 sm:p-8 flex flex-col items-center max-w-xs w-full"
          >
            <LogOut className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-red-600 mb-2">Logout</h2>
            <p className="text-gray-700 text-center text-sm sm:text-base mb-6">
              Are you sure you want to logout from the admin panel?
            </p>
            <div className="flex space-x-3 w-full">
              <Button
                onClick={() => setShowLogoutModal(false)}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Logout
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
