import { logPerformance, createTimer } from "./logger"

// Performance monitoring configuration
const PERFORMANCE_CONFIG = {
  enableMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING !== "false",
  slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || "1000"), // 1 second
  slowApiThreshold: parseInt(process.env.SLOW_API_THRESHOLD || "2000"), // 2 seconds
  memoryWarningThreshold: parseInt(process.env.MEMORY_WARNING_THRESHOLD || "80"), // 80%
}

// Performance metrics store
interface PerformanceMetrics {
  apiCalls: Map<string, { count: number; totalTime: number; avgTime: number }>
  dbQueries: Map<string, { count: number; totalTime: number; avgTime: number }>
  memoryUsage: number[]
  errorRates: Map<string, { total: number; errors: number }>
}

const metrics: PerformanceMetrics = {
  apiCalls: new Map(),
  dbQueries: new Map(),
  memoryUsage: [],
  errorRates: new Map(),
}

// Track API call performance
export function trackApiCall(endpoint: string, duration: number, success: boolean = true) {
  if (!PERFORMANCE_CONFIG.enableMonitoring) return

  // Update API call metrics
  const existing = metrics.apiCalls.get(endpoint) || { count: 0, totalTime: 0, avgTime: 0 }
  existing.count++
  existing.totalTime += duration
  existing.avgTime = existing.totalTime / existing.count
  metrics.apiCalls.set(endpoint, existing)

  // Update error rates
  const errorStats = metrics.errorRates.get(endpoint) || { total: 0, errors: 0 }
  errorStats.total++
  if (!success) errorStats.errors++
  metrics.errorRates.set(endpoint, errorStats)

  // Log slow API calls
  if (duration > PERFORMANCE_CONFIG.slowApiThreshold) {
    logPerformance(`SLOW_API_${endpoint}`, duration, {
      threshold: PERFORMANCE_CONFIG.slowApiThreshold,
      avgTime: existing.avgTime,
      callCount: existing.count,
    })
  }
}

// Track database query performance
export function trackDbQuery(operation: string, table: string, duration: number, success: boolean = true) {
  if (!PERFORMANCE_CONFIG.enableMonitoring) return

  const key = `${operation}_${table}`

  // Update query metrics
  const existing = metrics.dbQueries.get(key) || { count: 0, totalTime: 0, avgTime: 0 }
  existing.count++
  existing.totalTime += duration
  existing.avgTime = existing.totalTime / existing.count
  metrics.dbQueries.set(key, existing)

  // Log slow queries
  if (duration > PERFORMANCE_CONFIG.slowQueryThreshold) {
    logPerformance(`SLOW_QUERY_${key}`, duration, {
      threshold: PERFORMANCE_CONFIG.slowQueryThreshold,
      avgTime: existing.avgTime,
      queryCount: existing.count,
    })
  }
}

// Monitor memory usage
export function trackMemoryUsage() {
  if (!PERFORMANCE_CONFIG.enableMonitoring) return

  const memoryUsage = process.memoryUsage()
  const usagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)

  metrics.memoryUsage.push(usagePercent)

  // Keep only last 100 measurements
  if (metrics.memoryUsage.length > 100) {
    metrics.memoryUsage.shift()
  }

  // Log memory warnings
  if (usagePercent > PERFORMANCE_CONFIG.memoryWarningThreshold) {
    logPerformance("HIGH_MEMORY_USAGE", usagePercent, {
      threshold: PERFORMANCE_CONFIG.memoryWarningThreshold,
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
    })
  }
}

// Get performance summary
export function getPerformanceSummary() {
  const summary = {
    timestamp: new Date().toISOString(),
    apiCalls: Object.fromEntries(metrics.apiCalls),
    dbQueries: Object.fromEntries(metrics.dbQueries),
    memoryUsage: {
      current: metrics.memoryUsage[metrics.memoryUsage.length - 1] || 0,
      average:
        metrics.memoryUsage.length > 0
          ? Math.round(metrics.memoryUsage.reduce((a, b) => a + b, 0) / metrics.memoryUsage.length)
          : 0,
      max: Math.max(...metrics.memoryUsage, 0),
    },
    errorRates: Object.fromEntries(
      Array.from(metrics.errorRates.entries()).map(([key, value]) => [
        key,
        {
          ...value,
          errorRate: value.total > 0 ? Math.round((value.errors / value.total) * 100) : 0,
        },
      ])
    ),
  }

  return summary
}

// Performance middleware wrapper
export function withPerformanceTracking<T extends any[], R>(operation: string, handler: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<R> => {
    if (!PERFORMANCE_CONFIG.enableMonitoring) {
      return handler(...args)
    }

    const timer = createTimer()
    let success = true

    try {
      const result = await handler(...args)
      return result
    } catch (error) {
      success = false
      throw error
    } finally {
      const duration = timer.end()
      trackApiCall(operation, duration, success)
    }
  }
}

// Database operation wrapper
export function withDbPerformanceTracking<T extends any[], R>(
  operation: string,
  table: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    if (!PERFORMANCE_CONFIG.enableMonitoring) {
      return handler(...args)
    }

    const timer = createTimer()
    let success = true

    try {
      const result = await handler(...args)
      return result
    } catch (error) {
      success = false
      throw error
    } finally {
      const duration = timer.end()
      trackDbQuery(operation, table, duration, success)
    }
  }
}

// Start periodic memory monitoring
let memoryMonitorInterval: NodeJS.Timeout | null = null

export function startPerformanceMonitoring() {
  if (!PERFORMANCE_CONFIG.enableMonitoring || memoryMonitorInterval) {
    return
  }

  // Monitor memory usage every 30 seconds
  memoryMonitorInterval = setInterval(() => {
    trackMemoryUsage()
  }, 30000)

  // Performance monitoring started
}

export function stopPerformanceMonitoring() {
  if (memoryMonitorInterval) {
    clearInterval(memoryMonitorInterval)
    memoryMonitorInterval = null
    // Performance monitoring stopped
  }
}

// Reset metrics (useful for testing)
export function resetMetrics() {
  metrics.apiCalls.clear()
  metrics.dbQueries.clear()
  metrics.memoryUsage.length = 0
  metrics.errorRates.clear()
}

// Performance health check
export function getPerformanceHealth() {
  const summary = getPerformanceSummary()

  const issues: string[] = []

  // Check for slow API endpoints
  Object.entries(summary.apiCalls).forEach(([endpoint, stats]) => {
    if (stats.avgTime > PERFORMANCE_CONFIG.slowApiThreshold) {
      issues.push(`Slow API endpoint: ${endpoint} (avg: ${stats.avgTime}ms)`)
    }
  })

  // Check for slow database queries
  Object.entries(summary.dbQueries).forEach(([query, stats]) => {
    if (stats.avgTime > PERFORMANCE_CONFIG.slowQueryThreshold) {
      issues.push(`Slow database query: ${query} (avg: ${stats.avgTime}ms)`)
    }
  })

  // Check memory usage
  if (summary.memoryUsage.current > PERFORMANCE_CONFIG.memoryWarningThreshold) {
    issues.push(`High memory usage: ${summary.memoryUsage.current}%`)
  }

  // Check error rates
  Object.entries(summary.errorRates).forEach(([endpoint, stats]) => {
    if (stats.errorRate > 10) {
      // More than 10% error rate
      issues.push(`High error rate: ${endpoint} (${stats.errorRate}%)`)
    }
  })

  return {
    status: issues.length === 0 ? "healthy" : "degraded",
    issues,
    summary,
  }
}

// Export configuration for external use
export { PERFORMANCE_CONFIG }
