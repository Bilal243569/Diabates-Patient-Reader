"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, Upload, User, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { signupAction } from "@/app/actions/auth"
import { setUserSession } from "@/lib/session"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "Please select a valid image file" }))
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image size should be less than 5MB" }))
        return
      }

      setProfileImage(file)
      setErrors((prev) => ({ ...prev, image: "" }))

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newErrors.name = "Full name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!profileImage) newErrors.image = "Profile picture is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("password", formData.password)
      if (profileImage) {
        formDataToSend.append("profileImage", profileImage)
      }

      const result = await signupAction(formDataToSend)

      if (result.success && result.user) {
        setSuccess(true)
        // Set user session
        setUserSession(result.user)
        setShowSuccessModal(true)
        setTimeout(() => {
          setShowSuccessModal(false)
          router.push("/dashboard")
        }, 1500)
      } else {
        setErrors({ general: result.error || "Failed to create account" })
        setShowErrorModal(true)
        setTimeout(() => setShowErrorModal(false), 2000)
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" })
      setShowErrorModal(true)
      setTimeout(() => setShowErrorModal(false), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
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
        ease: "easeOut" as const,
      },
    },
  }

  const imageVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created Successfully!</h2>
            <p className="text-gray-600 mb-4">Welcome to DiabetesTracker, {formData.name}!</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 relative overflow-hidden">
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
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">DiabetesTracker</span>
            </Link>
          </div>

          <motion.div variants={cardVariants}>
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900">Create Your Account</CardTitle>
                <CardDescription className="text-gray-600">
                  Start tracking your blood sugar levels today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{errors.general}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Profile Image Upload - REQUIRED */}
                  <div className="space-y-2">
                    <Label htmlFor="image" className="flex items-center space-x-2">
                      <span>Profile Picture</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-col items-center space-y-4">
                      <motion.div
                        variants={imageVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="relative cursor-pointer"
                      >
                        {imagePreview ? (
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Profile preview"
                            width={100}
                            height={100}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                            <User className="h-10 w-10 text-purple-500" />
                          </div>
                        )}
                      </motion.div>
                      <div className="relative">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required
                        />
                        <Label
                          htmlFor="image"
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-purple-600 rounded-lg hover:bg-white transition-colors border-2 border-purple-200 shadow-lg"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {profileImage ? "Change Photo" : "Upload Photo"}
                        </Label>
                      </div>
                      {errors.image && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{errors.image}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center space-x-2">
                      <span>Full Name</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`border-2 focus:border-purple-500 bg-white/80 backdrop-blur-sm ${
                        errors.name ? "border-red-300" : "border-purple-200"
                      }`}
                      required
                    />
                    {errors.name && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center space-x-2">
                      <span>Email Address</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`border-2 focus:border-purple-500 bg-white/80 backdrop-blur-sm ${
                        errors.email ? "border-red-300" : "border-purple-200"
                      }`}
                      required
                    />
                    {errors.email && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center space-x-2">
                      <span>Password</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      className={`border-2 focus:border-purple-500 bg-white/80 backdrop-blur-sm ${
                        errors.password ? "border-red-300" : "border-purple-200"
                      }`}
                      required
                    />
                    {errors.password && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                      <span>Confirm Password</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`border-2 focus:border-purple-500 bg-white/80 backdrop-blur-sm ${
                        errors.confirmPassword ? "border-red-300" : "border-purple-200"
                      }`}
                      required
                    />
                    {errors.confirmPassword && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>

                  <motion.div 
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg py-3 font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </motion.div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-purple-500 hover:underline font-medium">
                      Sign in here
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center max-w-xs w-full">
            <svg className="h-16 w-16 text-purple-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2l4-4" />
            </svg>
            <h2 className="text-2xl font-semibold text-purple-600 mb-2">Success</h2>
            <p className="text-gray-700 text-center">Account created successfully! Redirecting...</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center max-w-xs w-full">
            <svg className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6M9 9l6 6" />
            </svg>
            <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-700 text-center">{errors.general || "Account creation failed!"}</p>
          </div>
        </div>
      )}
    </div>
  )
}
