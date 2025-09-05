import { createClient, RedisClientType } from "redis"
import { logPerformance, createTimer } from "./logger"

// Cache configuration
const CACHE_CONFIG = {
  enabled: process.env.ENABLE_REDIS_CACHE !== "false",
  url: process.env.REDIS_URL || "redis://localhost:6379",
  defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || "300"), // 5 minutes
  maxRetries: parseInt(process.env.CACHE_MAX_RETRIES || "3"),
  retryDelay: parseInt(process.env.CACHE_RETRY_DELAY || "1000"), // 1 second
}

// Cache TTL configurations for different data types
const CACHE_TTL = {
  subscriber_data: 300, // 5 minutes
  analytics_data: 60, // 1 minute
  health_check: 30, // 30 seconds
  performance_metrics: 120, // 2 minutes
  fraud_alerts: 180, // 3 minutes
  user_session: 3600, // 1 hour
}

// Redis client instance
let redisClient: RedisClientType | null = null
let isConnected = false

// In-memory fallback cache for when Redis is unavailable
const memoryCache = new Map<string, { value: any; expires: number }>()

// Initialize Redis connection
export async function initializeCache(): Promise<boolean> {
  if (!CACHE_CONFIG.enabled) {
    // Redis cache disabled
    return false
  }

  try {
    redisClient = createClient({
      url: CACHE_CONFIG.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > CACHE_CONFIG.maxRetries) {
            console.error("Redis max retries exceeded")
            return false
          }
          return Math.min(retries * CACHE_CONFIG.retryDelay, 3000)
        },
      },
    })

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err)
      isConnected = false
    })

    redisClient.on("connect", () => {
      // Redis Client Connected
      isConnected = true
    })

    redisClient.on("disconnect", () => {
      // Redis Client Disconnected
      isConnected = false
    })

    await redisClient.connect()
    return true
  } catch (error) {
    console.error("Failed to initialize Redis cache:", error)
    redisClient = null
    isConnected = false
    return false
  }
}

// Disconnect Redis
export async function disconnectCache(): Promise<void> {
  if (redisClient && isConnected) {
    try {
      await redisClient.disconnect()
      // Redis cache disconnected
    } catch (error) {
      console.error("Error disconnecting Redis:", error)
    }
  }
}

// Memory cache cleanup
function cleanupMemoryCache(): void {
  const now = Date.now()
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expires < now) {
      memoryCache.delete(key)
    }
  }
}

// Set cache value
export async function setCache(key: string, value: any, ttl: number = CACHE_CONFIG.defaultTtl): Promise<boolean> {
  const timer = createTimer()

  try {
    const serializedValue = JSON.stringify(value)

    // Try Redis first
    if (redisClient && isConnected) {
      await redisClient.setEx(key, ttl, serializedValue)
      const duration = timer.end()
      logPerformance("cache_set_redis", duration, { key, ttl })
      return true
    }

    // Fallback to memory cache
    memoryCache.set(key, {
      value: serializedValue,
      expires: Date.now() + ttl * 1000,
    })

    const duration = timer.end()
    logPerformance("cache_set_memory", duration, { key, ttl })
    return true
  } catch (error) {
    const duration = timer.end()
    console.error("Cache set failed:", error)
    logPerformance("cache_set_error", duration, { key, error: error instanceof Error ? error.message : "Unknown" })
    return false
  }
}

// Get cache value
export async function getCache<T = any>(key: string): Promise<T | null> {
  const timer = createTimer()

  try {
    // Try Redis first
    if (redisClient && isConnected) {
      const value = await redisClient.get(key)
      const duration = timer.end()

      if (value) {
        logPerformance("cache_hit_redis", duration, { key })
        return JSON.parse(value) as T
      } else {
        logPerformance("cache_miss_redis", duration, { key })
      }
    }

    // Fallback to memory cache
    cleanupMemoryCache()
    const entry = memoryCache.get(key)
    const duration = timer.end()

    if (entry && entry.expires > Date.now()) {
      logPerformance("cache_hit_memory", duration, { key })
      return JSON.parse(entry.value) as T
    } else {
      logPerformance("cache_miss_memory", duration, { key })
      if (entry) {
        memoryCache.delete(key) // Remove expired entry
      }
    }

    return null
  } catch (error) {
    const duration = timer.end()
    console.error("Cache get failed:", error)
    logPerformance("cache_get_error", duration, { key, error: error instanceof Error ? error.message : "Unknown" })
    return null
  }
}

// Delete cache value
export async function deleteCache(key: string): Promise<boolean> {
  try {
    // Try Redis first
    if (redisClient && isConnected) {
      await redisClient.del(key)
    }

    // Also remove from memory cache
    memoryCache.delete(key)
    return true
  } catch (error) {
    console.error("Cache delete failed:", error)
    return false
  }
}

// Clear all cache
export async function clearCache(): Promise<boolean> {
  try {
    // Clear Redis
    if (redisClient && isConnected) {
      await redisClient.flushAll()
    }

    // Clear memory cache
    memoryCache.clear()
    return true
  } catch (error) {
    console.error("Cache clear failed:", error)
    return false
  }
}

// Cache wrapper for functions
export function withCache<T extends any[], R>(
  cacheKey: string | ((...args: T) => string),
  ttl: number = CACHE_CONFIG.defaultTtl,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const key = typeof cacheKey === "function" ? cacheKey(...args) : cacheKey

    // Try to get from cache first
    const cached = await getCache<R>(key)
    if (cached !== null) {
      return cached
    }

    // Execute handler and cache result
    const result = await handler(...args)
    await setCache(key, result, ttl)

    return result
  }
}

// Specific cache functions for common operations
export const CacheOperations = {
  // Subscriber data caching
  getSubscriberData: (id: string, searchType: string) => getCache(`subscriber:${searchType}:${id}`),

  setSubscriberData: (id: string, searchType: string, data: any) =>
    setCache(`subscriber:${searchType}:${id}`, data, CACHE_TTL.subscriber_data),

  // Analytics caching
  getAnalytics: (type: string) => getCache(`analytics:${type}`),

  setAnalytics: (type: string, data: any) => setCache(`analytics:${type}`, data, CACHE_TTL.analytics_data),

  // Health check caching
  getHealthCheck: () => getCache("health:status"),

  setHealthCheck: (data: any) => setCache("health:status", data, CACHE_TTL.health_check),

  // Performance metrics caching
  getPerformanceMetrics: () => getCache("performance:metrics"),

  setPerformanceMetrics: (data: any) => setCache("performance:metrics", data, CACHE_TTL.performance_metrics),

  // User session caching
  getUserSession: (userId: string) => getCache(`session:${userId}`),

  setUserSession: (userId: string, data: any) => setCache(`session:${userId}`, data, CACHE_TTL.user_session),

  deleteUserSession: (userId: string) => deleteCache(`session:${userId}`),

  // Generic cache operations
  setCache: (key: string, data: any, ttl?: number) => setCache(key, data, ttl),
  getCache: (key: string) => getCache(key),
}

// Cache statistics
export async function getCacheStats(): Promise<any> {
  const stats = {
    redis_connected: isConnected,
    redis_url: CACHE_CONFIG.url,
    memory_cache_size: memoryCache.size,
    cache_enabled: CACHE_CONFIG.enabled,
    default_ttl: CACHE_CONFIG.defaultTtl,
  }

  // Get Redis info if connected
  if (redisClient && isConnected) {
    try {
      const info = await redisClient.info("memory")
      const keyspace = await redisClient.info("keyspace")

      ;(stats as any)["redis_memory"] = info
      ;(stats as any)["redis_keyspace"] = keyspace
    } catch (error) {
      console.error("Failed to get Redis stats:", error)
    }
  }

  return stats
}

// Health check for cache
export async function checkCacheHealth(): Promise<{ status: string; details: any }> {
  try {
    if (!CACHE_CONFIG.enabled) {
      return {
        status: "disabled",
        details: { message: "Cache is disabled" },
      }
    }

    // Test Redis connection
    if (redisClient && isConnected) {
      const testKey = "health_check_test"
      const testValue = Date.now().toString()

      await redisClient.setEx(testKey, 10, testValue)
      const retrieved = await redisClient.get(testKey)
      await redisClient.del(testKey)

      if (retrieved === testValue) {
        return {
          status: "healthy",
          details: {
            redis_connected: true,
            memory_cache_size: memoryCache.size,
            test_passed: true,
          },
        }
      }
    }

    // Test memory cache fallback
    const testKey = "memory_health_test"
    const testValue = { test: true, timestamp: Date.now() }

    memoryCache.set(testKey, {
      value: JSON.stringify(testValue),
      expires: Date.now() + 10000,
    })

    const retrieved = memoryCache.get(testKey)
    memoryCache.delete(testKey)

    if (retrieved) {
      return {
        status: "degraded",
        details: {
          redis_connected: false,
          memory_cache_working: true,
          memory_cache_size: memoryCache.size,
        },
      }
    }

    return {
      status: "unhealthy",
      details: { message: "Both Redis and memory cache failed" },
    }
  } catch (error) {
    return {
      status: "unhealthy",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        redis_connected: isConnected,
      },
    }
  }
}

// Export cache configuration
export { CACHE_CONFIG, CACHE_TTL }
