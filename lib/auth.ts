import bcrypt from "bcryptjs"
import { getUser, createUser, getUserById } from "./db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const SESSION_COOKIE_NAME = "attendance_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function authenticateUser(email: string, password: string) {
  const user = await getUser(email)
  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return null
  }

  // Remove password hash from returned user object
  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function registerUser(userData: {
  email: string
  name: string
  password: string
  role: "admin" | "cr" | "teacher" | "student"
  student_id?: string
  phone?: string
}) {
  // Check if user already exists
  const existingUser = await getUser(userData.email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password
  const password_hash = await hashPassword(userData.password)

  // Create user
  const user = await createUser({
    ...userData,
    password_hash,
  })

  // Remove password hash from returned user object
  const { password_hash: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function createUserSession(userId: number) {
  const sessionData = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  }

  const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString("base64")

  cookies().set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: "/",
  })
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    const sessionData = JSON.parse(Buffer.from(sessionToken, "base64").toString())

    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      await logout()
      return null
    }

    // Get user from database
    const user = await getUserById(sessionData.userId)
    if (!user) {
      await logout()
      return null
    }

    // Remove password hash from returned user object
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error("Error getting current user:", error)
    await logout()
    return null
  }
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect("/")
  }

  return user
}

// Fix getUserById function to use string parameter to match db.ts
// async function getUserById(id: number) {
//   const { neon } = await import("@neondatabase/serverless")
//   const sql = neon(process.env.DATABASE_URL!)
//
//   const users = await sql`
//     SELECT * FROM users WHERE id = ${id}
//   `
//
//   return users[0] || null
// }
