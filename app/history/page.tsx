"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowLeft, Download, Filter, Search, Calendar, FileText, Table, Share2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getSugarReadings } from "@/lib/neon"
import { getUserSession } from "@/lib/session"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface SugarReading {
  id: number
  reading_type: string
  sugar_level: number
  reading_date: string
  reading_time: string
  notes: string | null
}

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<SugarReading[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      setLoading(false);
      setHistoryData([]);
      return;
    }
    fetchHistoryData(session.id);
  }, [])

  const fetchHistoryData = async (userId: number) => {
    setLoading(true)
    try {
      const readings = await getSugarReadings(userId, 100)
      console.log("Raw readings from DB:", readings);
      setHistoryData(readings as SugarReading[])
    } catch (error) {
      console.error("Error fetching history data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (level: number, type: string) => {
    if (type === "fasting") {
      if (level >= 70 && level <= 100) return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
      if (level > 100) return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
    } else {
      if (level < 140) return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
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

  // Helper function to format date safely
  const formatDate = (dateValue: string | Date) => {
    try {
      if (typeof dateValue === "string") {
        // If it's already a string, return as is (assuming it's in YYYY-MM-DD format)
        return dateValue
      } else if (dateValue instanceof Date) {
        // If it's a Date object, format it
        return dateValue.toISOString().split("T")[0]
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
      console.error("Error formatting time:", error)
      return "Invalid Time"
    }
  }

  const filteredData = historyData.filter((reading) => {
    const matchesSearch =
      (reading.notes && reading.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      formatDate(reading.reading_date).includes(searchTerm) ||
      reading.sugar_level.toString().includes(searchTerm)
    const matchesType = filterType === "all" || reading.reading_type === filterType
    const status = getStatus(reading.sugar_level, reading.reading_type)
    const matchesStatus = filterStatus === "all" || status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const downloadCSV = () => {
    const headers = ["Date", "Day", "Time", "Type", "Level (mg/dL)", "Status", "Notes"]
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          formatDate(row.reading_date),
          (() => {
            let year, month, day;
            if (typeof row.reading_date === "string") {
              [year, month, day] = row.reading_date.split("-");
            } else if (typeof row.reading_date === "object" && row.reading_date !== null && typeof (row.reading_date as Date).getFullYear === "function") {
              const d = row.reading_date as Date;
              year = d.getFullYear();
              month = String(d.getMonth() + 1).padStart(2, "0");
              day = String(d.getDate()).padStart(2, "0");
            } else {
              return "Invalid Date";
            }
            const date = new Date(Number(year), Number(month) - 1, Number(day));
            return date.toLocaleDateString("en-PK", { year: "numeric", month: "numeric", day: "numeric", timeZone: "Asia/Karachi" });
          })(),
          formatTime(row.reading_time),
          row.reading_type,
          row.sugar_level,
          getStatus(row.sugar_level, row.reading_type),
          `"${row.notes || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `blood-sugar-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Blood Sugar Reading History", 14, 16);
    doc.setFontSize(10);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = [
      "Date",
      "Day",
      "Time",
      "Type",
      "Level (mg/dL)",
      "Status",
      "Notes"
    ];

    const tableRows = filteredData.map((row) => [
      (() => {
        let year, month, day;
        if (typeof row.reading_date === "string") {
          [year, month, day] = row.reading_date.split("-");
        } else if (typeof row.reading_date === "object" && row.reading_date !== null && typeof (row.reading_date as Date).getFullYear === "function") {
          const d = row.reading_date as Date;
          year = d.getFullYear();
          month = String(d.getMonth() + 1).padStart(2, "0");
          day = String(d.getDate()).padStart(2, "0");
        } else {
          return "Invalid Date";
        }
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return date.toLocaleDateString("en-PK", { year: "numeric", month: "numeric", day: "numeric", timeZone: "Asia/Karachi" });
      })(),
      (() => {
        let year, month, day;
        if (typeof row.reading_date === "string") {
          [year, month, day] = row.reading_date.split("-");
        } else if (typeof row.reading_date === "object" && row.reading_date !== null && typeof (row.reading_date as Date).getFullYear === "function") {
          const d = row.reading_date as Date;
          year = d.getFullYear();
          month = String(d.getMonth() + 1).padStart(2, "0");
          day = String(d.getDate()).padStart(2, "0");
        } else {
          return "Invalid Date";
        }
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return date.toLocaleDateString("en-PK", { weekday: "long", timeZone: "Asia/Karachi" });
      })(),
      formatTime(row.reading_time),
      row.reading_type,
      row.sugar_level,
      getStatus(row.sugar_level, row.reading_type),
      row.notes || "No notes"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [139, 92, 246] }, // purple
      alternateRowStyles: { fillColor: [245, 243, 255] },
      margin: { left: 8, right: 8 },
    });

    doc.save(`blood-sugar-history-${new Date().toISOString().split("T")[0]}.pdf`);
  }

  const shareWithWhatsApp = () => {
    // Header row
    const header = "Date       | Time   | Type      | Level | Status | Notes";
    const separator = "-------------------------------------------------------------";
    // Format each row with padding for alignment
    const rows = filteredData.map(row => {
      const date = (typeof row.reading_date === "string" ? row.reading_date : "").padEnd(10, " ");
      const time = row.reading_time.padEnd(7, " ");
      const type = row.reading_type.padEnd(9, " ");
      const level = String(row.sugar_level).padStart(5, " ");
      const status = getStatus(row.sugar_level, row.reading_type).padEnd(6, " ");
      const notes = (row.notes || "No notes");
      return `${date} | ${time} | ${type} | ${level} | ${status} | ${notes}`;
    });

    const message =
      "Blood Sugar Readings:%0A" +
      "```%0A" +
      header + "%0A" +
      separator + "%0A" +
      rows.join("%0A") + "%0A" +
      "```";

    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

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
          <p className="text-gray-600 text-sm sm:text-base">Loading history...</p>
        </motion.div>
      </div>
    )
  }

  // Show message if not logged in
  if (!getUserSession()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-base sm:text-lg text-gray-700">Please log in to view your reading history.</p>
          <Link href="/login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
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
                  <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Reading History
                </h1>
              </motion.div>
            </div>
            <div className="flex space-x-1 sm:space-x-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Button
                  onClick={downloadCSV}
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent text-xs h-8 sm:h-9"
                >
                  <Table className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Button
                  onClick={downloadPDF}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent text-xs h-8 sm:h-9"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
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
          {/* Filters */}
          <motion.div variants={fadeInUpVariants}>
            <Card className="mb-4 sm:mb-6 lg:mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-gray-800 text-base sm:text-lg">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Filter & Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search readings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-purple-200 focus:border-purple-500 h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-500 h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="fasting">Fasting</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="before-meal">Before Meal</SelectItem>
                      <SelectItem value="after-meal">After Meal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-500 h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="elevated">Elevated</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 sm:col-span-2 lg:col-span-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{filteredData.length} readings found</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* History Table */}
          <motion.div variants={slideInVariants}>
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-gray-800">Complete Reading History</CardTitle>
                <CardDescription className="text-gray-600 text-sm sm:text-base">
                  All your blood sugar measurements with detailed information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  {/* Desktop Table */}
                  <table className="w-full hidden lg:table">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Day</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Level</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((reading) => (
                        <motion.tr
                          key={reading.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-800">{(() => {
                            let year, month, day;
                            if (typeof reading.reading_date === "string") {
                              [year, month, day] = reading.reading_date.split("-");
                            } else if (typeof reading.reading_date === "object" && reading.reading_date !== null && typeof (reading.reading_date as Date).getFullYear === "function") {
                              const d = reading.reading_date as Date;
                              year = d.getFullYear();
                              month = String(d.getMonth() + 1).padStart(2, "0");
                              day = String(d.getDate()).padStart(2, "0");
                            } else {
                              return "Invalid Date";
                            }
                            const date = new Date(Number(year), Number(month) - 1, Number(day));
                            return date.toLocaleDateString("en-PK", { year: "numeric", month: "numeric", day: "numeric", timeZone: "Asia/Karachi" });
                          })()}</td>
                          <td className="py-3 px-4 text-gray-600">{(() => {
                            let year, month, day;
                            if (typeof reading.reading_date === "string") {
                              [year, month, day] = reading.reading_date.split("-");
                            } else if (typeof reading.reading_date === "object" && reading.reading_date !== null && typeof (reading.reading_date as Date).getFullYear === "function") {
                              const d = reading.reading_date as Date;
                              year = d.getFullYear();
                              month = String(d.getMonth() + 1).padStart(2, "0");
                              day = String(d.getDate()).padStart(2, "0");
                            } else {
                              return "Invalid Date";
                            }
                            const date = new Date(Number(year), Number(month) - 1, Number(day));
                            return date.toLocaleDateString("en-PK", { year: "numeric", month: "numeric", day: "numeric", timeZone: "Asia/Karachi" });
                          })()}</td>
                          <td className="py-3 px-4 text-gray-600">{formatTime(reading.reading_time)}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="border-purple-200 text-purple-700 capitalize">
                              {reading.reading_type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-800">{reading.sugar_level}</span>
                            <span className="text-gray-500 text-sm ml-1">mg/dL</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(reading.sugar_level, reading.reading_type)}>
                              {getStatus(reading.sugar_level, reading.reading_type)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={reading.notes || ""}>
                            {reading.notes || "No notes"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3 p-4">
                    {filteredData.map((reading) => (
                      <motion.div
                        key={reading.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {(() => {
                                let year, month, day;
                                if (typeof reading.reading_date === "string") {
                                  [year, month, day] = reading.reading_date.split("-");
                                } else if (typeof reading.reading_date === "object" && reading.reading_date !== null && typeof (reading.reading_date as Date).getFullYear === "function") {
                                  const d = reading.reading_date as Date;
                                  year = d.getFullYear();
                                  month = String(d.getMonth() + 1).padStart(2, "0");
                                  day = String(d.getDate()).padStart(2, "0");
                                } else {
                                  return "Invalid Date";
                                }
                                const date = new Date(Number(year), Number(month) - 1, Number(day));
                                return date.toLocaleDateString("en-PK", { year: "numeric", month: "numeric", day: "numeric", timeZone: "Asia/Karachi" });
                              })()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800">{reading.sugar_level}</p>
                            <p className="text-gray-500 text-xs">mg/dL</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="border-purple-200 text-purple-700 capitalize text-xs">
                            {reading.reading_type}
                          </Badge>
                          <Badge className={`${getStatusColor(reading.sugar_level, reading.reading_type)} text-xs`}>
                            {getStatus(reading.sugar_level, reading.reading_type)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{formatTime(reading.reading_time)}</span>
                          {reading.notes && (
                            <span className="text-gray-500 text-xs truncate max-w-32" title={reading.notes}>
                              {reading.notes}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">No readings found matching your criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Download Options */}
          <motion.div variants={fadeInUpVariants} className="mt-4 sm:mt-6 lg:mt-8">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-gray-800 text-base sm:text-lg">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Download Options</span>
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm sm:text-base">Export your data in different formats</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Button
                    onClick={downloadCSV}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-10 sm:h-11 text-sm sm:text-base"
                  >
                    <Table className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Download as CSV
                  </Button>
                  <Button
                    onClick={downloadPDF}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 h-10 sm:h-11 text-sm sm:text-base"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Download as PDF
                  </Button>
                  <Button 
                    onClick={shareWithWhatsApp}
                    className="bg-green-500 text-white hover:bg-green-600 h-10 sm:h-11 text-sm sm:text-base"
                  >
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Share with Doctor (WhatsApp)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
