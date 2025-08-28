import { EventEmitter } from 'events'
import { shouldUseRealData } from './database'
import { detectFraud } from './fraud-detection'
import { logBusinessEvent, logSystemHealth } from './logger'
import { CacheOperations } from './cache'

// Real-time streaming configuration
const STREAMING_CONFIG = {
  enableStreaming: process.env.ENABLE_REAL_TIME_STREAMING !== 'false',
  eventInterval: parseInt(process.env.STREAMING_EVENT_INTERVAL || '5000'), // 5 seconds
  batchSize: parseInt(process.env.STREAMING_BATCH_SIZE || '10'),
  maxListeners: parseInt(process.env.STREAMING_MAX_LISTENERS || '100'),
}

// Event types
export enum StreamEventType {
  NEW_CALL = 'new_call',
  FRAUD_ALERT = 'fraud_alert',
  SYSTEM_STATUS = 'system_status',
  SUBSCRIBER_UPDATE = 'subscriber_update',
  PERFORMANCE_METRIC = 'performance_metric',
}

// Stream event interface
interface StreamEvent {
  id: string
  type: StreamEventType
  timestamp: Date
  data: any
  metadata?: Record<string, any>
}

// Real-time data stream class
class RealTimeDataStream extends EventEmitter {
  private isActive: boolean = false
  private intervalId: NodeJS.Timeout | null = null
  private eventCounter: number = 0

  constructor() {
    super()
    this.setMaxListeners(STREAMING_CONFIG.maxListeners)
  }

  // Start the real-time data stream
  start(): void {
    if (this.isActive) {
      console.log('Real-time stream is already active')
      return
    }

    if (!STREAMING_CONFIG.enableStreaming) {
      console.log('Real-time streaming is disabled')
      return
    }

    this.isActive = true
    console.log('Starting real-time data stream...')

    // Generate events at regular intervals
    this.intervalId = setInterval(() => {
      this.generateStreamEvents()
    }, STREAMING_CONFIG.eventInterval)

    logSystemHealth('real_time_streaming', 'healthy', {
      interval: STREAMING_CONFIG.eventInterval,
      batchSize: STREAMING_CONFIG.batchSize,
    })

    this.emit('stream_started', {
      timestamp: new Date(),
      config: STREAMING_CONFIG,
    })
  }

  // Stop the real-time data stream
  stop(): void {
    if (!this.isActive) {
      console.log('Real-time stream is not active')
      return
    }

    this.isActive = false
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    console.log('Real-time data stream stopped')
    
    logSystemHealth('real_time_streaming', 'healthy', {
      message: 'Stream stopped gracefully',
      eventsGenerated: this.eventCounter,
    })

    this.emit('stream_stopped', {
      timestamp: new Date(),
      eventsGenerated: this.eventCounter,
    })
  }

  // Generate batch of stream events
  private async generateStreamEvents(): Promise<void> {
    try {
      const events: StreamEvent[] = []

      // Generate different types of events
      for (let i = 0; i < STREAMING_CONFIG.batchSize; i++) {
        const eventType = this.getRandomEventType()
        const event = await this.generateEvent(eventType)
        events.push(event)
      }

      // Emit events
      events.forEach(event => {
        this.emit('data', event)
        this.emit(event.type, event)
        this.eventCounter++
      })

      // Cache latest events
      await CacheOperations.setCache('latest_stream_events', events, 60)

    } catch (error) {
      console.error('Error generating stream events:', error)
      this.emit('error', error)
    }
  }

  // Get random event type based on probability
  private getRandomEventType(): StreamEventType {
    const rand = Math.random()
    
    if (rand < 0.4) return StreamEventType.NEW_CALL
    if (rand < 0.5) return StreamEventType.FRAUD_ALERT
    if (rand < 0.7) return StreamEventType.SUBSCRIBER_UPDATE
    if (rand < 0.9) return StreamEventType.PERFORMANCE_METRIC
    return StreamEventType.SYSTEM_STATUS
  }

  // Generate specific event based on type
  private async generateEvent(type: StreamEventType): Promise<StreamEvent> {
    const baseEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      metadata: {
        source: shouldUseRealData() ? 'database' : 'simulation',
        generator: 'real_time_streaming',
      },
    }

    switch (type) {
      case StreamEventType.NEW_CALL:
        return {
          ...baseEvent,
          data: this.generateCallEvent(),
        }

      case StreamEventType.FRAUD_ALERT:
        return {
          ...baseEvent,
          data: await this.generateFraudAlertEvent(),
        }

      case StreamEventType.SUBSCRIBER_UPDATE:
        return {
          ...baseEvent,
          data: this.generateSubscriberUpdateEvent(),
        }

      case StreamEventType.PERFORMANCE_METRIC:
        return {
          ...baseEvent,
          data: this.generatePerformanceMetricEvent(),
        }

      case StreamEventType.SYSTEM_STATUS:
        return {
          ...baseEvent,
          data: this.generateSystemStatusEvent(),
        }

      default:
        throw new Error(`Unknown event type: ${type}`)
    }
  }

  // Generate call event data
  private generateCallEvent(): any {
    return {
      call_id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      msisdn: `+1555${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      called_number: `+1555${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      call_type: Math.random() > 0.8 ? 'VIDEO' : 'VOICE',
      direction: Math.random() > 0.5 ? 'OUTGOING' : 'INCOMING',
      start_time: new Date(),
      duration: Math.floor(Math.random() * 3600), // 0-60 minutes
      cell_id: `CELL_${Math.floor(Math.random() * 1000)}`,
      location: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      },
      cost: (Math.random() * 5).toFixed(2),
      is_international: Math.random() > 0.9,
      is_roaming: Math.random() > 0.95,
    }
  }

  // Generate fraud alert event data
  private async generateFraudAlertEvent(): Promise<any> {
    const subscriberId = `sub_${Math.random().toString(36).substr(2, 8)}`
    
    // Simulate fraud detection (simplified)
    const alertTypes = ['VELOCITY_FRAUD', 'LOCATION_ANOMALY', 'DEVICE_FRAUD', 'PREMIUM_RATE_FRAUD']
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    
    return {
      alert_id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subscriber_id: subscriberId,
      alert_type: alertType,
      severity: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW',
      risk_score: Math.floor(Math.random() * 100),
      confidence: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
      title: `${alertType.replace('_', ' ')} Detected`,
      description: `Suspicious ${alertType.toLowerCase()} pattern detected for subscriber`,
      evidence: {
        trigger: 'real_time_analysis',
        data_points: Math.floor(Math.random() * 50) + 10,
        time_window: '5 minutes',
      },
    }
  }

  // Generate subscriber update event data
  private generateSubscriberUpdateEvent(): any {
    return {
      subscriber_id: `sub_${Math.random().toString(36).substr(2, 8)}`,
      msisdn: `+1555${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      update_type: Math.random() > 0.5 ? 'risk_score_update' : 'profile_update',
      previous_risk_score: Math.floor(Math.random() * 100),
      new_risk_score: Math.floor(Math.random() * 100),
      risk_level: Math.random() > 0.8 ? 'HIGH' : Math.random() > 0.5 ? 'MEDIUM' : 'LOW',
      reason: 'Behavioral pattern analysis',
      updated_fields: ['risk_score', 'risk_level', 'last_risk_update'],
    }
  }

  // Generate performance metric event data
  private generatePerformanceMetricEvent(): any {
    return {
      metric_type: 'system_performance',
      metrics: {
        api_response_time: Math.floor(Math.random() * 500) + 100, // 100-600ms
        database_query_time: Math.floor(Math.random() * 200) + 50, // 50-250ms
        cache_hit_rate: Math.floor(Math.random() * 30) + 70, // 70-100%
        active_connections: Math.floor(Math.random() * 100) + 50,
        memory_usage: Math.floor(Math.random() * 40) + 40, // 40-80%
        cpu_usage: Math.floor(Math.random() * 60) + 20, // 20-80%
      },
      thresholds: {
        api_response_time: 2000,
        database_query_time: 1000,
        cache_hit_rate: 80,
        memory_usage: 85,
        cpu_usage: 80,
      },
    }
  }

  // Generate system status event data
  private generateSystemStatusEvent(): any {
    return {
      status_type: 'health_check',
      overall_status: Math.random() > 0.95 ? 'degraded' : 'healthy',
      services: {
        database: Math.random() > 0.98 ? 'degraded' : 'healthy',
        cache: Math.random() > 0.97 ? 'degraded' : 'healthy',
        fraud_engine: Math.random() > 0.99 ? 'degraded' : 'healthy',
        api_gateway: 'healthy',
      },
      metrics: {
        uptime: Math.floor(Math.random() * 86400) + 3600, // 1-25 hours
        total_requests: Math.floor(Math.random() * 10000) + 1000,
        error_rate: Math.random() * 5, // 0-5%
        active_users: Math.floor(Math.random() * 500) + 100,
      },
    }
  }

  // Get stream status
  getStatus(): any {
    return {
      is_active: this.isActive,
      events_generated: this.eventCounter,
      listeners: this.listenerCount('data'),
      config: STREAMING_CONFIG,
      uptime: this.isActive ? Date.now() - (this.eventCounter * STREAMING_CONFIG.eventInterval) : 0,
    }
  }
}

// Global stream instance
const globalStream = new RealTimeDataStream()

// Export stream instance and utilities
export { globalStream as realTimeStream, RealTimeDataStream, StreamEvent }

// Stream management functions
export function startRealTimeStream(): void {
  globalStream.start()
}

export function stopRealTimeStream(): void {
  globalStream.stop()
}

export function getStreamStatus(): any {
  return globalStream.getStatus()
}

// Subscribe to stream events
export function subscribeToStream(
  eventType: StreamEventType | 'data' | 'error',
  callback: (event: StreamEvent) => void
): void {
  globalStream.on(eventType, callback)
}

// Unsubscribe from stream events
export function unsubscribeFromStream(
  eventType: StreamEventType | 'data' | 'error',
  callback: (event: StreamEvent) => void
): void {
  globalStream.off(eventType, callback)
}

// Get latest stream events from cache
export async function getLatestStreamEvents(): Promise<StreamEvent[]> {
  const events = await CacheOperations.getCache('latest_stream_events')
  return events || []
}

// Export configuration
export { STREAMING_CONFIG }
