"use server"

import { createUser, getUserByEmail } from "@/lib/neon"
import { uploadProfileImage } from "@/lib/blob"
import bcrypt from "bcryptjs"

export async function signupAction(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const profileImage = formData.get("profileImage") as File

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  if (!profileImage || profileImage.size === 0) {
    return { error: "Profile image is required" }
  }

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return { error: "User already exists with this email" }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Upload profile image
    const userId = Date.now().toString() // Temporary ID for filename
    const profileImageUrl = await uploadProfileImage(profileImage, userId)

    // Create user with profile image
    const user = await createUser(email, name, passwordHash, profileImageUrl)

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_image_url: user.profile_image_url,
        role: "user" as const,
      },
    }
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "Failed to create account. Please try again." }
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const user = await getUserByEmail(email)
    if (!user) {
      return { error: "Invalid email or password" }
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return { error: "Invalid email or password" }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_image_url: user.profile_image_url,
        role: "user" as const,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Failed to sign in. Please try again." }
  }
}
