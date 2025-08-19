"use client"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Shield, TrendingUp, Heart, Calendar, Share2, Settings } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
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

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.42, 0, 1, 1] as [number, number, number, number],
      },
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
        ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E86C1] to-[#007BFF] relative overflow-hidden">







      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo and Title */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-6 shadow-2xl">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">DiabetesTracker</h1>
            <p className="text-xl md:text-2xl text-white/90 font-light">Connect with trusted healthcare monitoring</p>
          </motion.div>

          {/* Main Action Cards */}
          <motion.div variants={itemVariants} className="grid gap-6 max-w-2xl mx-auto mb-12">
            <motion.div variants={cardVariants} whileHover="hover">
              <Link href="/login">
                <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl cursor-pointer transition-all duration-300 hover:shadow-3xl">
                  <CardHeader className="flex flex-row items-center space-y-0 p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl mr-4 shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-xl text-gray-800 mb-1">Patient Login</CardTitle>
                      <CardDescription className="text-gray-600">
                        Track your blood sugar levels and health data
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Link href="/admin-login">
                <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl cursor-pointer transition-all duration-300 hover:shadow-3xl">
                  <CardHeader className="flex flex-row items-center space-y-0 p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl mr-4 shadow-lg">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-xl text-gray-800 mb-1">Admin Panel</CardTitle>
                      <CardDescription className="text-gray-600">
                        Manage users and system administration
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Link href="/signup">
                <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl cursor-pointer transition-all duration-300 hover:shadow-3xl">
                  <CardHeader className="flex flex-row items-center space-y-0 p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl mr-4 shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-xl text-gray-800 mb-1">New User Registration</CardTitle>
                      <CardDescription className="text-gray-600">
                        Create your account and start tracking today
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            <motion.div variants={cardVariants} whileHover="hover" className="text-center">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-xl">
                <TrendingUp className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium text-sm">Analytics</p>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} whileHover="hover" className="text-center">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-xl">
                <Heart className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium text-sm">Health Tracking</p>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} whileHover="hover" className="text-center">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-xl">
                <Calendar className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium text-sm">Scheduling</p>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} whileHover="hover" className="text-center">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-xl">
                <Share2 className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium text-sm">Sharing</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-white/80">Active Patients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500K+</div>
              <div className="text-white/80">Readings Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-white/80">User Satisfaction</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-white/60 text-sm">
        © 2025 DiabetesTracker. Trusted healthcare monitoring platform.
      </div>
    </div>
  )
}
