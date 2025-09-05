import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated", authenticated: false }, { status: 401 })
    }

    // Validate session (with database fallback to mock)
    const sessionResult = await validateSession(token)

    if (!sessionResult.valid) {
      // Clear invalid cookie
      cookieStore.delete("auth-token")

      return NextResponse.json(
        {
          error: sessionResult.error || "Invalid session",
          authenticated: false,
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: sessionResult.user,
      authenticated: true,
      source: sessionResult.source, // For debugging/monitoring
    })
  } catch (error) {
    console.error("Authentication check failed:", error)
    return NextResponse.json(
      {
        error: "Authentication check failed",
        authenticated: false,
      },
      { status: 500 }
    )
  }
}
