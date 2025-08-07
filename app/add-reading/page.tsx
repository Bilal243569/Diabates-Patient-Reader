"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Activity, ArrowLeft, Calendar, Clock, AlertCircle, CheckCircle, Sun, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { getUserSession } from "@/lib/session"
import { UserDropdown } from "@/components/user-dropdown"
import { addReadingAction } from "@/app/actions/readings"

export default function AddReadingPage() {
  const [formData, setFormData] = useState({
    type: "",
    date: "",
    time: "",
    level: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [userSession, setUserSession] = useState(getUserSession())
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const session = getUserSession()
    if (!session) {
      router.push("/login")
      return
    }
    setUserSession(session)

    // Set current date and time as defaults
    const now = new Date()
    const currentDate = now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0")
    const currentTime = now.toTimeString().slice(0, 5)

    setFormData((prev) => ({
      ...prev,
      date: currentDate,
      time: currentTime,
    }))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!userSession) {
      setError("Please log in to add readings")
      setIsLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("type", formData.type)
      formDataToSend.append("level", formData.level)
      formDataToSend.append("date", formData.date)
      formDataToSend.append("time", formData.time)
      formDataToSend.append("notes", formData.notes)
      formDataToSend.append("userId", userSession.id.toString())

      console.log("Submitting reading:", {
        type: formData.type,
        level: formData.level,
        date: formData.date,
        time: formData.time,
        userId: userSession.id
      })

      const result = await addReadingAction(formDataToSend)

      if (result.success) {
        console.log("Reading added successfully:", result.reading)
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(result.error || "Failed to save reading")
      }
    } catch (error) {
      console.error("Error adding reading:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error when user starts typing
    if (error) {
      setError("")
    }
  }

  // Format time for display with AM/PM
  const formatTimeDisplay = (time24: string) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    const hour12 = Number.parseInt(hours) % 12 || 12
    const ampm = Number.parseInt(hours) >= 12 ? "PM" : "AM"
    return `${hour12}:${minutes} ${ampm}`
  }

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Today"
    } else if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Yesterday"
    } else if (dateStr === tomorrow.toISOString().split("T")[0]) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  // Get current day name
  const getCurrentDayName = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const today = new Date()
    return days[today.getDay()]
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

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.42, 0, 1, 1] as [number, number, number, number] }}
          className="text-center"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-200">
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Reading Added Successfully!</h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">Your blood sugar reading has been recorded.</p>
            <p className="text-xs sm:text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Fixed Header for Mobile */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.42, 0, 1, 1] as [number, number, number, number] }}
        className="bg-white/95 backdrop-blur-md shadow-lg border-b border-emerald-100 fixed top-0 left-0 right-0 z-50"
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
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50 text-xs sm:text-sm">
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
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl shadow-lg">
                  <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Add New Reading
                </h1>
              </motion.div>
            </div>
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
      </motion.header>

      {/* Main Content with Top Padding for Fixed Header */}
      <div className="pt-14 sm:pt-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
          className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
      >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Form */}
            <motion.div variants={slideInVariants} className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md hover:shadow-3xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-800 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-emerald-600" />
                  <span>Record Blood Sugar Level</span>
                </CardTitle>
                  <CardDescription className="text-gray-600 text-sm sm:text-base">
                  Enter your blood sugar reading details below
                </CardDescription>
              </CardHeader>
                <CardContent className="p-4 sm:p-6 lg:p-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                      className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600 text-sm sm:text-base"
                  >
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {/* Reading Type */}
                    <motion.div variants={itemVariants} className="space-y-2 sm:space-y-3">
                      <Label htmlFor="type" className="text-sm sm:text-base font-semibold text-gray-700">
                      Reading Type *
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-emerald-200 focus:border-emerald-500 bg-white/90 text-base sm:text-lg rounded-xl shadow-sm">
                        <SelectValue placeholder="Select reading type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fasting">🌅 Fasting (Before eating)</SelectItem>
                        <SelectItem value="random">🎲 Random (Any time)</SelectItem>
                        <SelectItem value="before-meal">🍽️ Before Meal</SelectItem>
                        <SelectItem value="after-meal">🍴 After Meal</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Date, Day, and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <motion.div variants={itemVariants} className="space-y-2 sm:space-y-3">
                      <Label
                        htmlFor="date"
                          className="text-sm sm:text-base font-semibold text-gray-700 flex items-center space-x-2"
                      >
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                        <span>Date *</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                          className="h-12 sm:h-14 border-2 border-emerald-200 focus:border-emerald-500 bg-white/90 text-base sm:text-lg rounded-xl shadow-sm"
                        required
                      />
                      {formData.date && (
                          <p className="text-xs sm:text-sm text-emerald-600 font-medium">{formatDateDisplay(formData.date)}</p>
                      )}
                    </motion.div>

                      <motion.div variants={itemVariants} className="space-y-2 sm:space-y-3">
                      <Label
                        htmlFor="day"
                          className="text-sm sm:text-base font-semibold text-gray-700 flex items-center space-x-2"
                      >
                          <Sun className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                        <span>Day</span>
                      </Label>
                      <Input
                        id="day"
                        type="text"
                        value={getCurrentDayName()}
                        readOnly
                          className="h-12 sm:h-14 border-2 border-emerald-200 bg-emerald-50/50 text-base sm:text-lg rounded-xl shadow-sm text-emerald-700 font-medium"
                      />
                        <p className="text-xs sm:text-sm text-emerald-600 font-medium">Current day</p>
                    </motion.div>

                      <motion.div variants={itemVariants} className="space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
                      <Label
                        htmlFor="time"
                          className="text-sm sm:text-base font-semibold text-gray-700 flex items-center space-x-2"
                      >
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                        <span>Time *</span>
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleChange("time", e.target.value)}
                          className="h-12 sm:h-14 border-2 border-emerald-200 focus:border-emerald-500 bg-white/90 text-base sm:text-lg rounded-xl shadow-sm"
                        required
                      />
                      {formData.time && (
                          <p className="text-xs sm:text-sm text-emerald-600 font-medium">{formatTimeDisplay(formData.time)}</p>
                      )}
                    </motion.div>
                  </div>

                  {/* Sugar Level */}
                    <motion.div variants={itemVariants} className="space-y-2 sm:space-y-3">
                      <Label htmlFor="level" className="text-sm sm:text-base font-semibold text-gray-700">
                      Blood Sugar Level (mg/dL) *
                    </Label>
                    <Input
                      id="level"
                      type="number"
                      placeholder="Enter reading (e.g., 120)"
                      value={formData.level}
                      onChange={(e) => handleChange("level", e.target.value)}
                      min="50"
                      max="500"
                        className="h-14 sm:h-16 border-2 border-emerald-200 focus:border-emerald-500 bg-white/90 text-lg sm:text-xl lg:text-2xl font-bold text-center rounded-xl shadow-sm"
                      required
                    />
                      <p className="text-xs sm:text-sm text-gray-500 text-center">
                      Normal range: 70-140 mg/dL (fasting: 70-100 mg/dL)
                    </p>
                  </motion.div>

                  {/* Notes */}
                    <motion.div variants={itemVariants} className="space-y-2 sm:space-y-3">
                      <Label htmlFor="notes" className="text-sm sm:text-base font-semibold text-gray-700">
                      Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes about this reading..."
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                        rows={3}
                        className="border-2 border-emerald-200 focus:border-emerald-500 bg-white/90 resize-none rounded-xl shadow-sm text-sm sm:text-base"
                    />
                  </motion.div>

                  {/* Submit Buttons */}
                  <motion.div
                    variants={itemVariants}
                      className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6"
                  >
                    <motion.div 
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1"
                    >
                      <Button
                        type="submit"
                          className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-base sm:text-lg shadow-xl rounded-xl"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                              <span className="text-sm sm:text-base">Saving Reading...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span className="text-sm sm:text-base">Save Reading</span>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                    <Link href="/dashboard" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                          className="w-full h-12 sm:h-14 border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-base sm:text-lg bg-white/90 rounded-xl shadow-lg"
                      >
                        Cancel
                      </Button>
                    </Link>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
            <motion.div variants={slideInVariants} className="space-y-4 sm:space-y-6">
            {/* Current Reading Preview */}
            {(formData.type || formData.level || formData.date || formData.time) && (
              <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg text-emerald-800 flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Reading Preview</span>
                  </CardTitle>
                </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {formData.type && (
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600 font-medium text-xs sm:text-sm">Type:</span>
                        <span className="font-bold capitalize text-emerald-700 text-xs sm:text-sm">{formData.type.replace("-", " ")}</span>
                    </div>
                  )}
                  {formData.level && (
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600 font-medium text-xs sm:text-sm">Level:</span>
                        <span className="font-bold text-lg sm:text-xl lg:text-2xl text-emerald-800">{formData.level} mg/dL</span>
                    </div>
                  )}
                  {formData.date && (
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600 font-medium text-xs sm:text-sm">Date:</span>
                        <span className="font-medium text-emerald-700 text-xs sm:text-sm">{formatDateDisplay(formData.date)}</span>
                    </div>
                  )}
                  {formData.time && (
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600 font-medium text-xs sm:text-sm">Time:</span>
                        <span className="font-medium text-emerald-700 text-xs sm:text-sm">{formatTimeDisplay(formData.time)}</span>
                    </div>
                  )}
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-white/60 rounded-lg">
                      <span className="text-gray-600 font-medium text-xs sm:text-sm">Day:</span>
                      <span className="font-medium text-emerald-700 text-xs sm:text-sm">{getCurrentDayName()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blood Sugar Reference */}
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-md hover:shadow-2xl transition-all duration-300">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-gray-800 flex items-center space-x-2">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  <span>Blood Sugar Reference</span>
                </CardTitle>
              </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-bold text-green-700 mb-2 sm:mb-3 flex items-center text-xs sm:text-sm">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2"></div>
                      Normal Levels
                    </h4>
                      <ul className="space-y-1 sm:space-y-2 text-green-600 ml-3 sm:ml-5 text-xs sm:text-sm">
                      <li>• Fasting: 70-100 mg/dL</li>
                      <li>• Random: Less than 140 mg/dL</li>
                      <li>• Before meals: 80-130 mg/dL</li>
                    </ul>
                  </div>
                    <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-bold text-red-700 mb-2 sm:mb-3 flex items-center text-xs sm:text-sm">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-2"></div>
                      Consult Doctor If
                    </h4>
                      <ul className="space-y-1 sm:space-y-2 text-red-600 ml-3 sm:ml-5 text-xs sm:text-sm">
                      <li>• Fasting: Above 126 mg/dL</li>
                      <li>• Random: Above 200 mg/dL</li>
                      <li>• Frequent high readings</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-cyan-800 flex items-center space-x-2">
                  <span>💡</span>
                  <span>Tips for Accurate Readings</span>
                </CardTitle>
              </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full flex-shrink-0"></div>
                    <span>Wash hands before testing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full flex-shrink-0"></div>
                    <span>Use the side of your fingertip</span>
                  </li>
                  <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full flex-shrink-0"></div>
                    <span>Record readings at consistent times</span>
                  </li>
                  <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full flex-shrink-0"></div>
                    <span>Note any factors affecting readings</span>
                  </li>
                  <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full flex-shrink-0"></div>
                    <span>Keep your meter clean and calibrated</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
      </div>
    </div>
  )
}
