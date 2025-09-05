import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma, shouldUseRealData } from "./database"
import type { User } from "@prisma/client"

// JWT configuration
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"

// Mock users for demo mode (keeping existing functionality)
const mockUsers = [
  {
    id: "1",
    username: "fraud.analyst",
    email: "analyst@fraudguard.com",
    password: "demo123",
    role: "ANALYST" as const,
    permissions: ["view_dashboard", "export_reports", "manage_cases"],
  },
  {
    id: "2",
    username: "admin",
    email: "admin@fraudguard.com",
    password: "admin123",
    role: "ADMIN" as const,
    permissions: ["view_dashboard", "export_reports", "manage_cases", "admin_panel"],
  },
  {
    id: "3",
    username: "demo",
    email: "demo@fraudguard.com",
    password: "demo",
    role: "DEMO" as const,
    permissions: ["view_dashboard"],
  },
]

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || "12")
  return bcrypt.hash(password, rounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET || "fallback-secret", { expiresIn: "24h" })
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

// Authenticate user (with fallback to mock data)
export async function authenticateUser(username: string, password: string) {
  if (!shouldUseRealData()) {
    // Use mock authentication for demo
    const user = mockUsers.find((u) => u.username === username && u.password === password)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    })

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      token,
      source: "mock_auth",
    }
  }

  try {
    // Real database authentication
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        permissions: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      throw new Error("Invalid credentials")
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      throw new Error("Invalid credentials")
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    })

    // Create session record
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      token,
      source: "database_auth",
    }
  } catch (error) {
    console.error("Database authentication failed, falling back to mock:", error)

    // Fallback to mock authentication
    const user = mockUsers.find((u) => u.username === username && u.password === password)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    })

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      token,
      source: "mock_fallback",
    }
  }
}

// Validate session
export async function validateSession(token: string) {
  try {
    const decoded = verifyToken(token)

    if (!shouldUseRealData()) {
      // Mock validation
      return {
        user: {
          id: decoded.userId,
          username: decoded.username,
          role: decoded.role,
          permissions: decoded.permissions,
        },
        valid: true,
        source: "mock_validation",
      }
    }

    // Real database validation
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      throw new Error("Session expired")
    }

    return {
      user: {
        id: session.user.id,
        username: session.user.username,
        role: session.user.role,
        permissions: session.user.permissions,
      },
      valid: true,
      source: "database_validation",
    }
  } catch (error) {
    return {
      user: null,
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Logout user
export async function logoutUser(token: string) {
  if (!shouldUseRealData()) {
    // Mock logout - just return success
    return { success: true, source: "mock_logout" }
  }

  try {
    // Delete session from database
    await prisma.session.delete({
      where: { token },
    })
    return { success: true, source: "database_logout" }
  } catch (error) {
    console.error("Database logout failed:", error)
    return { success: true, source: "mock_fallback" } // Still return success
  }
}

// Get demo credentials (for UI)
export function getDemoCredentials() {
  return mockUsers.map((user) => ({
    username: user.username,
    password: user.password,
    role: user.role === "ANALYST" ? "Fraud Analyst" : user.role === "ADMIN" ? "Administrator" : "Demo User",
    description:
      user.role === "ANALYST"
        ? "Full access to fraud detection features"
        : user.role === "ADMIN"
          ? "Complete system access with admin privileges"
          : "Limited access for demonstration purposes",
  }))
}

// Audit logging helper
export async function logUserAction(
  userId: string,
  action: string,
  resource: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) {
  if (!shouldUseRealData()) {
    // Mock audit log entry
    return
  }

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        details: details || {},
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error("Failed to log user action:", error)
  }
}
