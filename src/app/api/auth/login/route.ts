import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { authenticateUser, getDemoCredentials, logUserAction } from "@/lib/auth"
import { withSecurity, validateInput, ValidationSchemas } from "@/lib/security"
import { logRequest, logResponse, logAuthEvent, createTimer } from "@/lib/logger"

async function loginHandler(request: NextRequest) {
  const timer = createTimer()
  const requestData = logRequest(request, { operation: "login" })

  try {
    const body = await request.json()

    // Validate input (with graceful fallback)
    const validation = validateInput(ValidationSchemas.login, body)
    if (!validation.success) {
          logAuthEvent("AUTH_FAILURE", undefined, undefined, requestData.ip || "unknown", requestData.userAgent || "unknown", {
      reason: "validation_failed",
      error: validation.error,
    })

      const duration = timer.end()
      logResponse(requestData, 400, duration)

      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error,
          success: false,
        },
        { status: 400 }
      )
    }

    const { username, password } = validation.data

    // Get client IP and user agent for audit logging
    const ipAddress = requestData.ip || "unknown"
    const userAgent = requestData.userAgent || "unknown"

    // Simulate authentication delay for demo purposes
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Authenticate user (with database fallback to mock)
    const authResult = await authenticateUser(username, password)

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    // Log successful login
    await logUserAction(authResult.user.id, "LOGIN", "auth", { source: authResult.source }, ipAddress, userAgent)

    logAuthEvent("LOGIN", authResult.user.id, authResult.user.username, ipAddress, userAgent, {
      source: authResult.source,
    })

    const duration = timer.end()
    logResponse(requestData, 200, duration, { userId: authResult.user.id })

    return NextResponse.json({
      success: true,
      user: authResult.user,
      token: authResult.token,
      source: authResult.source, // For debugging/monitoring
    })
  } catch (error) {
    const duration = timer.end()

    logAuthEvent("AUTH_FAILURE", undefined, undefined, "unknown", "unknown", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    logResponse(requestData, 401, duration, { error: "authentication_failed" })

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Authentication failed",
        success: false,
      },
      { status: 401 }
    )
  }
}

// Apply security middleware
export const POST = withSecurity(loginHandler)

// Demo credentials endpoint
export async function GET() {
  return NextResponse.json({
    demo_credentials: getDemoCredentials(),
  })
}
