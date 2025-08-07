"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowLeft, Database, Users, Bell, Share2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { getAllUsers, getSugarReadings, getAllReminders, getAllSharedReports } from "@/lib/neon"

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

interface Reminder {
  id: number
  user_id: number
  user_name: string
  profile_image_url: string | null
  reminder_type: string
  reminder_time: string | Date
  is_active: boolean
  days_of_week: number[]
}

interface SharedReport {
  id: number
  user_id: number
  user_name: string
  profile_image_url: string | null
  share_token: string
  report_type: string
  is_active: boolean
  expires_at: string | Date
}

export default function DatabasePage() {
  const [users, setUsers] = useState<User[]>([])
  const [readings, setReadings] = useState<SugarReading[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [reports, setReports] = useState<SharedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDatabaseData()
  }, [])

  const fetchDatabaseData = async () => {
    setLoading(true)
    setError("")
    try {
      const [usersData, readingsData, remindersData, reportsData] = await Promise.all([
        getAllUsers(),
        getSugarReadings(),
        getAllReminders(),
        getAllSharedReports(),
      ])

      setUsers(usersData as User[])
      setReadings(readingsData as SugarReading[])
      setReminders(remindersData as Reminder[])
      setReports(reportsData as SharedReport[])
    } catch (error) {
      console.error("Error fetching database data:", error)
      setError("Failed to fetch database data. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format date safely
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
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  // Helper function to format time safely
  const formatTime = (timeValue: string | Date) => {
    try {
      if (typeof timeValue === "string") {
        return timeValue.slice(0, 5) // Return HH:MM
      } else if (timeValue instanceof Date) {
        return timeValue.toTimeString().slice(0, 5)
      } else {
        return "Invalid Time"
      }
    } catch (error) {
      console.error("Error formatting time:", error)
      return "Invalid Time"
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
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Live Database Tables
                </h1>
              </div>
            </div>
            <Button
              onClick={fetchDatabaseData}
              variant="outline"
              size="sm"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {error && (
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Database Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Users className="h-5 w-5" />
                <span>Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-800">{users.length}</div>
              <p className="text-sm text-purple-600">Registered patients</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <Activity className="h-5 w-5" />
                <span>Readings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{readings.length}</div>
              <p className="text-sm text-blue-600">Sugar measurements</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Bell className="h-5 w-5" />
                <span>Reminders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">{reminders.length}</div>
              <p className="text-sm text-green-600">Active alerts</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-orange-700">
                <Share2 className="h-5 w-5" />
                <span>Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">{reports.length}</div>
              <p className="text-sm text-orange-600">Shared with doctors</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div variants={itemVariants}>
          <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <Users className="h-5 w-5" />
                <span>Users Table - Live Data from Neon</span>
              </CardTitle>
              <CardDescription>Real registered user accounts with profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Profile</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-sm font-semibold text-purple-600">{user.id}</td>
                        <td className="py-3 px-4">
                          {user.profile_image_url ? (
                            <Image
                              src={user.profile_image_url || "/placeholder.svg"}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full border-2 border-purple-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                        <td className="py-3 px-4 text-purple-600">{user.email}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(user.created_at)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No users found in database.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sugar Readings Table */}
        <motion.div variants={itemVariants}>
          <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <Activity className="h-5 w-5" />
                <span>Sugar Readings Table - Live Data from Neon</span>
              </CardTitle>
              <CardDescription>Real blood sugar measurements from patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Level</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((reading) => (
                      <motion.tr
                        key={reading.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-sm font-semibold text-blue-600">{reading.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {reading.profile_image_url ? (
                              <Image
                                src={reading.profile_image_url || "/placeholder.svg"}
                                alt={reading.user_name}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full border border-blue-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-500" />
                              </div>
                            )}
                            <span className="font-medium text-gray-800">{reading.user_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="border-blue-200 text-blue-700 capitalize">
                            {reading.reading_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-lg text-gray-800">{reading.sugar_level}</span>
                          <span className="text-gray-500 text-sm ml-1">mg/dL</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(reading.reading_date)}</td>
                        <td className="py-3 px-4 font-mono text-sm text-gray-600">
                          {formatTime(reading.reading_time)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={reading.notes || ""}>
                          {reading.notes || "No notes"}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {readings.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No readings found in database.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reminders Table */}
        <motion.div variants={itemVariants}>
          <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <Bell className="h-5 w-5" />
                <span>Reminders Table - Live Data from Neon</span>
              </CardTitle>
              <CardDescription>Patient notification and reminder settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Frequency</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reminders.map((reminder) => (
                      <motion.tr
                        key={reminder.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-100 hover:bg-green-50/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-sm font-semibold text-green-600">{reminder.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {reminder.profile_image_url ? (
                              <Image
                                src={reminder.profile_image_url || "/placeholder.svg"}
                                alt={reminder.user_name}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full border border-green-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-green-500" />
                              </div>
                            )}
                            <span className="font-medium text-gray-800">{reminder.user_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="border-green-200 text-green-700 capitalize">
                            {reminder.reminder_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm text-gray-600">
                          {formatTime(reminder.reminder_time)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {reminder.days_of_week.length === 7 ? "Daily" : "Weekdays"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              reminder.is_active
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {reminder.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {reminders.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No reminders found in database.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shared Reports Table */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <Share2 className="h-5 w-5" />
                <span>Shared Reports Table - Live Data from Neon</span>
              </CardTitle>
              <CardDescription>Doctor sharing and report generation data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Share Token</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-100 hover:bg-orange-50/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-sm font-semibold text-orange-600">{report.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {report.profile_image_url ? (
                              <Image
                                src={report.profile_image_url || "/placeholder.svg"}
                                alt={report.user_name}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full border border-orange-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-orange-500" />
                              </div>
                            )}
                            <span className="font-medium text-gray-800">{report.user_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {report.share_token}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="border-orange-200 text-orange-700 capitalize">
                            {report.report_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              report.is_active
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {report.is_active ? "Active" : "Expired"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(report.expires_at)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {reports.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No shared reports found in database.</p>
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
