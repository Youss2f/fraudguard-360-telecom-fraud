import { NextResponse } from "next/server"
import { withSecurity } from "@/lib/security"
import { performHealthCheck } from "@/lib/init"
import { createTimer } from "@/lib/logger"

async function healthHandler() {
  const timer = createTimer()

  try {
    // Perform comprehensive health check
    const healthData = await performHealthCheck()

    // Add response time
    const responseTime = timer.end()
    healthData.response_time_ms = responseTime

    return NextResponse.json(healthData)
  } catch (error) {
    const duration = timer.end()

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        details: error instanceof Error ? error.message : "Unknown error",
        response_time_ms: duration,
      },
      { status: 500 }
    )
  }
}

// Apply security middleware
export const GET = withSecurity(healthHandler)
