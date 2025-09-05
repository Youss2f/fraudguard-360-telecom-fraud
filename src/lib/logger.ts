import winston from "winston"
import { NextRequest } from "next/server"

// Logger configuration
const LOG_LEVEL = process.env.LOG_LEVEL || "info"
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || "./logs/app.log"
const ENABLE_FILE_LOGGING = process.env.ENABLE_FILE_LOGGING !== "false"
const ENABLE_CONSOLE_LOGGING = process.env.ENABLE_CONSOLE_LOGGING !== "false"

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from "fs"
import { dirname } from "path"

if (ENABLE_FILE_LOGGING) {
  const logDir = dirname(LOG_FILE_PATH)
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true })
  }
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    })
  })
)

// Create transports array
const transports: winston.transport[] = []

if (ENABLE_CONSOLE_LOGGING) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  )
}

if (ENABLE_FILE_LOGGING) {
  transports.push(
    new winston.transports.File({
      filename: LOG_FILE_PATH,
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  )
}

// Create logger instance
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
})

// Request logging middleware
export function logRequest(request: NextRequest, additionalData?: Record<string, any>) {
  const requestData = {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    timestamp: new Date().toISOString(),
    ...additionalData,
  }

  logger.info("API Request", requestData)
  return requestData
}

// Response logging
export function logResponse(
  requestData: any,
  status: number,
  responseTime: number,
  additionalData?: Record<string, any>
) {
  const responseData = {
    ...requestData,
    status,
    responseTime: `${responseTime}ms`,
    ...additionalData,
  }

  if (status >= 400) {
    logger.error("API Error Response", responseData)
  } else {
    logger.info("API Response", responseData)
  }
}

// Database operation logging
export function logDatabaseOperation(
  operation: string,
  table: string,
  duration: number,
  success: boolean,
  error?: string
) {
  const logData = {
    operation,
    table,
    duration: `${duration}ms`,
    success,
    error,
    timestamp: new Date().toISOString(),
  }

  if (success) {
    logger.debug("Database Operation", logData)
  } else {
    logger.error("Database Operation Failed", logData)
  }
}

// Authentication logging
export function logAuthEvent(
  event: "LOGIN" | "LOGOUT" | "TOKEN_REFRESH" | "AUTH_FAILURE",
  userId?: string,
  username?: string,
  ip?: string,
  userAgent?: string,
  additionalData?: Record<string, any>
) {
  const logData = {
    event,
    userId,
    username,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    ...additionalData,
  }

  if (event === "AUTH_FAILURE") {
    logger.warn("Authentication Event", logData)
  } else {
    logger.info("Authentication Event", logData)
  }
}

// Security event logging
export function logSecurityEvent(
  event: string,
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  details: Record<string, any>,
  request?: NextRequest
) {
  const logData = {
    event,
    severity,
    details,
    ip: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip"),
    userAgent: request?.headers.get("user-agent"),
    timestamp: new Date().toISOString(),
  }

  if (severity === "CRITICAL" || severity === "HIGH") {
    logger.error("Security Event", logData)
  } else if (severity === "MEDIUM") {
    logger.warn("Security Event", logData)
  } else {
    logger.info("Security Event", logData)
  }
}

// Performance monitoring
export function logPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
  const logData = {
    operation,
    duration: `${duration}ms`,
    metadata,
    timestamp: new Date().toISOString(),
  }

  if (duration > 5000) {
    // Slow operation (>5s)
    logger.warn("Slow Operation", logData)
  } else if (duration > 1000) {
    // Moderate operation (>1s)
    logger.info("Performance", logData)
  } else {
    logger.debug("Performance", logData)
  }
}

// Error logging with context
export function logError(error: Error | string, context: string, additionalData?: Record<string, any>) {
  const errorData = {
    context,
    error:
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error,
    ...additionalData,
    timestamp: new Date().toISOString(),
  }

  logger.error("Application Error", errorData)
}

// Business logic logging
export function logBusinessEvent(
  event: string,
  entityType: string,
  entityId: string,
  userId?: string,
  details?: Record<string, any>
) {
  const logData = {
    event,
    entityType,
    entityId,
    userId,
    details,
    timestamp: new Date().toISOString(),
  }

  logger.info("Business Event", logData)
}

// Fraud detection logging
export function logFraudEvent(
  alertType: string,
  subscriberId: string,
  riskScore: number,
  confidence: number,
  evidence: Record<string, any>
) {
  const logData = {
    alertType,
    subscriberId,
    riskScore,
    confidence,
    evidence,
    timestamp: new Date().toISOString(),
  }

  if (riskScore > 80) {
    logger.warn("High Risk Fraud Alert", logData)
  } else {
    logger.info("Fraud Alert", logData)
  }
}

// System health logging
export function logSystemHealth(
  component: string,
  status: "healthy" | "degraded" | "unhealthy",
  metrics?: Record<string, any>
) {
  const logData = {
    component,
    status,
    metrics,
    timestamp: new Date().toISOString(),
  }

  if (status === "unhealthy") {
    logger.error("System Health", logData)
  } else if (status === "degraded") {
    logger.warn("System Health", logData)
  } else {
    logger.info("System Health", logData)
  }
}

// Utility function to create a timer for measuring operation duration
export function createTimer() {
  const start = Date.now()
  return {
    end: () => Date.now() - start,
  }
}

// Middleware wrapper for automatic request/response logging
export function withLogging<T extends any[], R>(operation: string, handler: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<R> => {
    const timer = createTimer()

    try {
      logger.debug(`Starting ${operation}`)
      const result = await handler(...args)
      const duration = timer.end()

      logPerformance(operation, duration)
      logger.debug(`Completed ${operation}`, { duration: `${duration}ms` })

      return result
    } catch (error) {
      const duration = timer.end()
      logError(error as Error, operation, { duration: `${duration}ms` })
      throw error
    }
  }
}

// Export logger instance for direct use
export default logger
