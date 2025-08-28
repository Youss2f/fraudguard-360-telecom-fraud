import { PrismaClient } from '@prisma/client'
import { decryptDataObject, secureDataObject, isEncryptionEnabled } from './encryption'
import { trackDbQuery } from './performance'
import { logDatabaseOperation, createTimer } from './logger'
import { CacheOperations } from './cache'

// Global variable to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a single instance of Prisma client
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// In development, store the client on the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database connection helper
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Database disconnection helper
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
  }
}

// Health check for database
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      latency: 0, // Could measure actual latency
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Feature flag helper
export function shouldUseRealData(): boolean {
  return process.env.ENABLE_REAL_DATA === 'true'
}

export function shouldUseMockData(): boolean {
  return process.env.ENABLE_MOCK_DATA !== 'false'
}

export function isDemoMode(): boolean {
  return process.env.ENABLE_DEMO_MODE === 'true'
}

// Database query helpers with fallback to mock data
export async function getSubscriberData(id: string, searchType: 'msisdn' | 'imsi' = 'msisdn') {
  if (!shouldUseRealData()) {
    // Fallback to existing mock data system
    const { generateMockDataWithAI } = await import('./mock-data-ai')
    return generateMockDataWithAI(id, searchType)
  }

  // Try cache first
  const cachedData = await CacheOperations.getSubscriberData(id, searchType)
  if (cachedData) {
    return cachedData
  }

  const timer = createTimer()

  try {
    // For encrypted data, we need to search differently
    // In production, you'd have indexed hash fields for searching
    const whereClause = searchType === 'msisdn' ? { msisdn: id } : { imsi: id }
    
    const subscriber = await prisma.subscriber.findUnique({
      where: whereClause,
      include: {
        callRecords: {
          take: 50,
          orderBy: { startTime: 'desc' },
        },
        smsRecords: {
          take: 50,
          orderBy: { timestamp: 'desc' },
        },
        dataRecords: {
          take: 50,
          orderBy: { sessionStart: 'desc' },
        },
        fraudAlerts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        riskProfiles: {
          take: 1,
          orderBy: { profileDate: 'desc' },
        },
        investigations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!subscriber) {
      throw new Error(`Subscriber not found: ${id}`)
    }

    const duration = timer.end()
    logDatabaseOperation('SELECT', 'subscriber', duration, true)
    trackDbQuery('SELECT', 'subscriber', duration, true)

    // Decrypt sensitive data if encryption is enabled
    const decryptedSubscriber = isEncryptionEnabled()
      ? decryptDataObject(subscriber)
      : subscriber

    const result = {
      subscriber: decryptedSubscriber,
      callRecords: subscriber.callRecords,
      smsRecords: subscriber.smsRecords,
      dataRecords: subscriber.dataRecords,
      fraudAlerts: subscriber.fraudAlerts,
      riskProfile: subscriber.riskProfiles[0] || null,
      investigations: subscriber.investigations,
      source: 'database'
    }

    // Cache the result
    await CacheOperations.setSubscriberData(id, searchType, result)

    return result
  } catch (error) {
    const duration = timer.end()
    logDatabaseOperation('SELECT', 'subscriber', duration, false, error instanceof Error ? error.message : 'Unknown error')
    trackDbQuery('SELECT', 'subscriber', duration, false)

    console.error('Database query failed, falling back to mock data:', error)
    // Fallback to mock data if database query fails
    const { generateMockDataWithAI } = await import('./mock-data-ai')
    return generateMockDataWithAI(id, searchType)
  }
}

// Real-time analytics data
export async function getRealTimeAnalytics() {
  if (!shouldUseRealData()) {
    // Return mock data for demo
    return {
      timestamp: new Date().toISOString(),
      system_status: {
        fraud_detection_rate: Math.floor(Math.random() * 20) + 80,
        active_investigations: Math.floor(Math.random() * 50) + 150,
        risk_alerts: Math.floor(Math.random() * 10) + 5,
        network_health: Math.floor(Math.random() * 10) + 90,
      },
      source: 'mock_data'
    }
  }

  // Try cache first
  const cachedAnalytics = await CacheOperations.getAnalytics('real_time')
  if (cachedAnalytics) {
    return cachedAnalytics
  }

  try {
    const [
      totalSubscribers,
      activeInvestigations,
      openAlerts,
      recentCalls,
    ] = await Promise.all([
      prisma.subscriber.count({ where: { status: 'ACTIVE' } }),
      prisma.investigation.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.fraudAlert.count({ where: { status: 'OPEN' } }),
      prisma.callRecord.count({
        where: {
          startTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ])

    const result = {
      timestamp: new Date().toISOString(),
      system_status: {
        total_subscribers: totalSubscribers,
        active_investigations: activeInvestigations,
        open_alerts: openAlerts,
        recent_calls_24h: recentCalls,
        fraud_detection_rate: 95, // Could calculate from actual data
        network_health: 98,
      },
      source: 'real_database'
    }

    // Cache the result
    await CacheOperations.setAnalytics('real_time', result)

    return result
  } catch (error) {
    console.error('Failed to get real-time analytics from database:', error)
    // Fallback to mock data
    return {
      timestamp: new Date().toISOString(),
      system_status: {
        fraud_detection_rate: Math.floor(Math.random() * 20) + 80,
        active_investigations: Math.floor(Math.random() * 50) + 150,
        risk_alerts: Math.floor(Math.random() * 10) + 5,
        network_health: Math.floor(Math.random() * 10) + 90,
      },
      source: 'mock_fallback'
    }
  }
}

// Export types for use in components
export type { 
  User, 
  Subscriber, 
  CallRecord, 
  FraudAlert, 
  Investigation,
  RiskProfile 
} from '@prisma/client'
