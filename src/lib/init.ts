import { connectDatabase, checkDatabaseHealth } from './database'
import { initializeCache, checkCacheHealth } from './cache'
import { startPerformanceMonitoring } from './performance'
import { startRealTimeStream, getStreamStatus } from './real-time-streaming'
import { logSystemHealth } from './logger'

// Application initialization status
interface InitStatus {
  database: boolean
  cache: boolean
  performance: boolean
  streaming: boolean
  overall: boolean
}

let initializationStatus: InitStatus = {
  database: false,
  cache: false,
  performance: false,
  streaming: false,
  overall: false,
}

// Initialize all application services
export async function initializeApplication(): Promise<InitStatus> {
  console.log('🚀 Initializing FraudGuard 360° Application...')

  const results: InitStatus = {
    database: false,
    cache: false,
    performance: false,
    streaming: false,
    overall: false,
  }

  // Initialize database connection
  try {
    console.log('📊 Initializing database connection...')
    results.database = await connectDatabase()
    
    if (results.database) {
      console.log('✅ Database connection established')
      logSystemHealth('database', 'healthy')
    } else {
      console.log('⚠️  Database connection failed, using mock data fallback')
      logSystemHealth('database', 'degraded', { fallback: 'mock_data' })
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    logSystemHealth('database', 'unhealthy', { error: error instanceof Error ? error.message : 'Unknown' })
  }

  // Initialize cache system
  try {
    console.log('🗄️  Initializing cache system...')
    results.cache = await initializeCache()
    
    if (results.cache) {
      console.log('✅ Cache system initialized (Redis)')
      logSystemHealth('cache', 'healthy', { type: 'redis' })
    } else {
      console.log('⚠️  Redis unavailable, using memory cache fallback')
      logSystemHealth('cache', 'degraded', { fallback: 'memory_cache' })
      results.cache = true // Memory cache is always available
    }
  } catch (error) {
    console.error('❌ Cache initialization failed:', error)
    logSystemHealth('cache', 'unhealthy', { error: error instanceof Error ? error.message : 'Unknown' })
    results.cache = true // Memory cache fallback
  }

  // Initialize performance monitoring
  try {
    console.log('📈 Initializing performance monitoring...')
    startPerformanceMonitoring()
    results.performance = true
    console.log('✅ Performance monitoring started')
    logSystemHealth('performance_monitoring', 'healthy')
  } catch (error) {
    console.error('❌ Performance monitoring initialization failed:', error)
    logSystemHealth('performance_monitoring', 'unhealthy', { error: error instanceof Error ? error.message : 'Unknown' })
  }

  // Initialize real-time streaming
  try {
    console.log('📡 Initializing real-time streaming...')
    startRealTimeStream()
    results.streaming = true
    console.log('✅ Real-time streaming started')
    logSystemHealth('real_time_streaming', 'healthy')
  } catch (error) {
    console.error('❌ Real-time streaming initialization failed:', error)
    logSystemHealth('real_time_streaming', 'unhealthy', { error: error instanceof Error ? error.message : 'Unknown' })
  }

  // Determine overall status
  results.overall = results.database || results.cache || results.performance || results.streaming

  // Update global status
  initializationStatus = results

  // Log initialization summary
  console.log('\n📋 Initialization Summary:')
  console.log(`   Database: ${results.database ? '✅ Connected' : '⚠️  Mock Data Fallback'}`)
  console.log(`   Cache: ${results.cache ? '✅ Available' : '❌ Unavailable'}`)
  console.log(`   Performance: ${results.performance ? '✅ Monitoring Active' : '❌ Monitoring Disabled'}`)
  console.log(`   Streaming: ${results.streaming ? '✅ Real-time Active' : '❌ Streaming Disabled'}`)
  console.log(`   Overall: ${results.overall ? '✅ Application Ready' : '❌ Critical Failure'}`)

  if (results.overall) {
    console.log('\n🎉 FraudGuard 360° Application Successfully Initialized!')
    logSystemHealth('application', 'healthy', results)
  } else {
    console.log('\n⚠️  Application initialized with limited functionality')
    logSystemHealth('application', 'degraded', results)
  }

  return results
}

// Get current initialization status
export function getInitializationStatus(): InitStatus {
  return { ...initializationStatus }
}

// Health check for all services
export async function performHealthCheck(): Promise<any> {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    overall_status: 'healthy',
    services: {
      application: {
        status: 'healthy',
        uptime: Math.floor(process.uptime()),
        memory_usage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        node_version: process.version,
      },
      database: {
        status: 'unknown',
        details: {},
      },
      cache: {
        status: 'unknown',
        details: {},
      },
      initialization: initializationStatus,
    },
    environment: {
      node_env: process.env.NODE_ENV,
      enable_real_data: process.env.ENABLE_REAL_DATA === 'true',
      enable_demo_mode: process.env.ENABLE_DEMO_MODE === 'true',
      enable_encryption: process.env.ENABLE_ENCRYPTION === 'true',
      enable_cache: process.env.ENABLE_REDIS_CACHE !== 'false',
      enable_performance_monitoring: process.env.ENABLE_PERFORMANCE_MONITORING !== 'false',
    },
  }

  // Check database health
  try {
    const dbHealth = await checkDatabaseHealth()
    healthStatus.services.database = {
      status: dbHealth.status,
      details: dbHealth,
    }
  } catch (error) {
    healthStatus.services.database = {
      status: 'error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    }
  }

  // Check cache health
  try {
    const cacheHealth = await checkCacheHealth()
    healthStatus.services.cache = {
      status: cacheHealth.status,
      details: cacheHealth.details,
    }
  } catch (error) {
    healthStatus.services.cache = {
      status: 'error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    }
  }

  // Determine overall status
  const serviceStatuses = [
    healthStatus.services.application.status,
    healthStatus.services.database.status,
    healthStatus.services.cache.status,
  ]

  if (serviceStatuses.includes('unhealthy') || serviceStatuses.includes('error')) {
    healthStatus.overall_status = 'unhealthy'
  } else if (serviceStatuses.includes('degraded')) {
    healthStatus.overall_status = 'degraded'
  } else {
    healthStatus.overall_status = 'healthy'
  }

  return healthStatus
}

// Graceful shutdown
export async function gracefulShutdown(): Promise<void> {
  console.log('🛑 Initiating graceful shutdown...')

  try {
    // Stop performance monitoring
    const { stopPerformanceMonitoring } = await import('./performance')
    stopPerformanceMonitoring()
    console.log('✅ Performance monitoring stopped')

    // Disconnect cache
    const { disconnectCache } = await import('./cache')
    await disconnectCache()
    console.log('✅ Cache disconnected')

    // Disconnect database
    const { disconnectDatabase } = await import('./database')
    await disconnectDatabase()
    console.log('✅ Database disconnected')

    console.log('✅ Graceful shutdown completed')

  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error)
  }
}

// Setup process event handlers
export function setupProcessHandlers(): void {
  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal')
    await gracefulShutdown()
    process.exit(0)
  })

  // Graceful shutdown on SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('Received SIGINT signal')
    await gracefulShutdown()
    process.exit(0)
  })

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    logSystemHealth('application', 'unhealthy', { 
      error: error.message,
      stack: error.stack 
    })
    // Don't exit immediately, let the application handle it
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    logSystemHealth('application', 'unhealthy', { 
      error: 'unhandled_rejection',
      reason: reason instanceof Error ? reason.message : String(reason)
    })
  })

  console.log('✅ Process event handlers configured')
}

// Initialize application on module load (for Next.js)
if (typeof window === 'undefined') {
  // Only run on server side
  setupProcessHandlers()
  
  // Initialize application when the module is loaded
  initializeApplication().catch((error) => {
    console.error('Failed to initialize application:', error)
  })
}

// Export initialization status for external use
export { initializationStatus }
