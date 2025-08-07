"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Image from "next/image"
import { getUserSession, clearUserSession } from "@/lib/session"
import { useRouter } from "next/navigation"

interface UserDropdownProps {
  onLogout?: () => void
}

export function UserDropdown({ onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userSession, setUserSession] = useState(getUserSession())
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    // Update user session when component mounts or updates
    setUserSession(getUserSession())
  }, [])

  const handleLogout = () => {
    clearUserSession()
    setIsOpen(false)
    if (onLogout) {
      onLogout()
    } else {
      router.push("/")
    }
  }

  if (!userSession) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="flex items-center space-x-2 hover:bg-purple-50 p-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {userSession.profile_image_url ? (
          <Image
            src={userSession.profile_image_url || "/placeholder.svg"}
            alt={userSession.name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border-2 border-purple-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center border-2 border-purple-200">
            <User className="h-4 w-4 text-purple-600" />
          </div>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 sm:p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {userSession.profile_image_url ? (
                <Image
                  src={userSession.profile_image_url || "/placeholder.svg"}
                  alt={userSession.name}
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-purple-200 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center border-2 border-purple-200 flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userSession.name}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{userSession.email}</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 text-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
