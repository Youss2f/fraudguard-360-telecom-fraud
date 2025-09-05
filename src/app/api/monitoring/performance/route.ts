import { NextRequest, NextResponse } from "next/server"
import { withSecurity } from "@/lib/security"
import { getPerformanceSummary, getPerformanceHealth } from "@/lib/performance"
import { logRequest, logResponse, createTimer } from "@/lib/logger"

async function performanceHandler(request: NextRequest) {
  const timer = createTimer()
  const requestData = logRequest(request, { operation: "get_performance_metrics" })

  try {
    const { searchParams } = new URL(request.url)
    const includeHealth = searchParams.get("health") === "true"
    const includeDetails = searchParams.get("details") === "true"

    let response: any = {
      timestamp: new Date().toISOString(),
      monitoring_enabled: process.env.ENABLE_PERFORMANCE_MONITORING !== "false",
    }

    if (includeDetails) {
      response.summary = getPerformanceSummary()
    }

    if (includeHealth) {
      response.health = getPerformanceHealth()
    }

    // Basic metrics always included
    response.basic_metrics = {
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
        usage_percent: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      },
      node_version: process.version,
      platform: process.platform,
    }

    const duration = timer.end()
    logResponse(requestData, 200, duration)

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    const duration = timer.end()
    logResponse(requestData, 500, duration, { error: "performance_metrics_failed" })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve performance metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Apply security middleware
export const GET = withSecurity(performanceHandler)
