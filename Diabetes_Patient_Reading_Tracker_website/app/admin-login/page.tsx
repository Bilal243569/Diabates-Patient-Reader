"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Settings, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Admin credentials check
    if (email === "admin123@gmail.com" && password === "admin123") {
      // Store admin session
      localStorage.setItem("adminSession", "true")
      localStorage.setItem("userRole", "admin")
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        router.push("/admin")
      }, 1500)
    } else {
      setError("Invalid admin credentials")
      setShowErrorModal(true)
      setTimeout(() => setShowErrorModal(false), 2000)
    }

    setIsLoading(false)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.42, 0, 1, 1] as [number, number, number, number],
      },
    },
  }

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.42, 0, 1, 1] as [number, number, number, number],
      },
    },
  }

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">Admin Panel</span>
            </Link>
          </div>

          <motion.div variants={cardVariants}>
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl text-gray-900">Admin Access</CardTitle>
                <CardDescription className="text-gray-600">
                  Sign in to access the administration panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-2 border-red-200 focus:border-red-500 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm sm:text-base">Admin Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-2 border-red-200 focus:border-red-500 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                      required
                    />
                  </div>
                  <motion.div 
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg py-3 font-semibold text-sm sm:text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Access Admin Panel"}
                    </Button>
                  </motion.div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Not an admin?{" "}
                    <Link href="/login" className="text-red-500 hover:underline font-medium">
                      Patient Login
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 p-4">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl p-6 sm:p-8 flex flex-col items-center max-w-xs w-full"
          >
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-red-600 mb-2">Success</h2>
            <p className="text-gray-700 text-center text-sm sm:text-base">
              Admin login successful! Redirecting...
            </p>
          </motion.div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 p-4">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl p-6 sm:p-8 flex flex-col items-center max-w-xs w-full"
          >
            <XCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-700 text-center text-sm sm:text-base">
              Invalid admin credentials. Please try again.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  )
}
