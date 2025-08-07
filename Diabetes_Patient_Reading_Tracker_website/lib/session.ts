// Simple session management for demo purposes
// In production, use proper JWT tokens and secure storage

export interface UserSession {
  id: number
  email: string
  name: string
  profile_image_url: string | null
  role: "user" | "admin"
}

export function setUserSession(user: UserSession) {
  if (typeof window !== "undefined") {
    localStorage.setItem("userSession", JSON.stringify(user))
    localStorage.setItem("userRole", user.role)
  }
}

export function getUserSession(): UserSession | null {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("userSession")
    if (session) {
      try {
        return JSON.parse(session)
      } catch (error) {
        console.error("Error parsing user session:", error)
        clearUserSession()
      }
    }
  }
  return null
}

export function clearUserSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userSession")
    localStorage.removeItem("userRole")
    localStorage.removeItem("adminSession")
  }
}

export function isAuthenticated(): boolean {
  return getUserSession() !== null
}

export function isAdmin(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userRole") === "admin"
  }
  return false
}
