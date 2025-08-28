import { prisma, shouldUseRealData } from './database'
import { logFraudEvent, logBusinessEvent, createTimer } from './logger'
import { trackDbQuery } from './performance'
import { CacheOperations } from './cache'

// Fraud detection configuration
const FRAUD_CONFIG = {
  enableDetection: process.env.ENABLE_FRAUD_DETECTION !== 'false',
  velocityThreshold: parseInt(process.env.VELOCITY_THRESHOLD || '50'), // calls per hour
  costThreshold: parseFloat(process.env.COST_THRESHOLD || '100'), // USD
  internationalThreshold: parseInt(process.env.INTERNATIONAL_THRESHOLD || '10'), // calls per day
  riskScoreThreshold: parseFloat(process.env.RISK_SCORE_THRESHOLD || '75'),
  confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.8'),
}

// Fraud alert types
export enum FraudAlertType {
  VELOCITY_FRAUD = 'VELOCITY_FRAUD',
  LOCATION_ANOMALY = 'LOCATION_ANOMALY',
  DEVICE_FRAUD = 'DEVICE_FRAUD',
  BEHAVIORAL_ANOMALY = 'BEHAVIORAL_ANOMALY',
  ROAMING_FRAUD = 'ROAMING_FRAUD',
  PREMIUM_RATE_FRAUD = 'PREMIUM_RATE_FRAUD',
  SPAM_DETECTION = 'SPAM_DETECTION',
  ACCOUNT_TAKEOVER = 'ACCOUNT_TAKEOVER',
}

// Risk levels
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Fraud detection result
interface FraudDetectionResult {
  subscriberId: string
  riskScore: number
  riskLevel: RiskLevel
  confidence: number
  alerts: FraudAlert[]
  evidence: Record<string, any>
  timestamp: Date
}

// Fraud alert interface
interface FraudAlert {
  type: FraudAlertType
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  riskScore: number
  confidence: number
  evidence: Record<string, any>
}

// Behavioral patterns
interface BehaviorPattern {
  avgCallDuration: number
  avgDailyCalls: number
  avgDailySms: number
  avgDataUsage: number
  commonLocations: Array<{ lat: number; lng: number; frequency: number }>
  activeHours: number[]
  activeDays: number[]
  deviceFingerprint: string[]
}

// Velocity check - detect unusual call volume
async function checkVelocityFraud(subscriberId: string): Promise<FraudAlert | null> {
  if (!shouldUseRealData()) {
    // Mock velocity check
    const isVelocityFraud = Math.random() > 0.85
    if (isVelocityFraud) {
      return {
        type: FraudAlertType.VELOCITY_FRAUD,
        severity: 'HIGH',
        title: 'Unusual Call Volume Detected',
        description: 'Subscriber has made an unusually high number of calls in a short period',
        riskScore: 85,
        confidence: 0.92,
        evidence: {
          callsLastHour: Math.floor(Math.random() * 100) + 50,
          normalAverage: Math.floor(Math.random() * 20) + 5,
          timeWindow: '1 hour',
        },
      }
    }
    return null
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const recentCalls = await prisma.callRecord.count({
      where: {
        subscriberId,
        startTime: {
          gte: oneHourAgo,
        },
      },
    })

    if (recentCalls > FRAUD_CONFIG.velocityThreshold) {
      return {
        type: FraudAlertType.VELOCITY_FRAUD,
        severity: recentCalls > FRAUD_CONFIG.velocityThreshold * 2 ? 'CRITICAL' : 'HIGH',
        title: 'High Velocity Fraud Detected',
        description: `Subscriber made ${recentCalls} calls in the last hour`,
        riskScore: Math.min(100, (recentCalls / FRAUD_CONFIG.velocityThreshold) * 50 + 50),
        confidence: 0.95,
        evidence: {
          callsLastHour: recentCalls,
          threshold: FRAUD_CONFIG.velocityThreshold,
          timeWindow: '1 hour',
        },
      }
    }

    return null
  } catch (error) {
    console.error('Velocity fraud check failed:', error)
    return null
  }
}

// Location anomaly detection
async function checkLocationAnomaly(subscriberId: string): Promise<FraudAlert | null> {
  if (!shouldUseRealData()) {
    // Mock location anomaly
    const isLocationAnomaly = Math.random() > 0.9
    if (isLocationAnomaly) {
      return {
        type: FraudAlertType.LOCATION_ANOMALY,
        severity: 'MEDIUM',
        title: 'Unusual Location Pattern',
        description: 'Subscriber activity detected in unusual geographic locations',
        riskScore: 65,
        confidence: 0.78,
        evidence: {
          unusualLocations: ['New York', 'London', 'Tokyo'],
          timeSpan: '2 hours',
          distanceTraveled: '12,000 km',
        },
      }
    }
    return null
  }

  try {
    // Get recent call locations
    const recentCalls = await prisma.callRecord.findMany({
      where: {
        subscriberId,
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
        latitude: { not: null },
        longitude: { not: null },
      },
      orderBy: { startTime: 'desc' },
      take: 50,
    })

    if (recentCalls.length < 2) return null

    // Calculate distances between consecutive calls
    const suspiciousMovements = []
    for (let i = 0; i < recentCalls.length - 1; i++) {
      const call1 = recentCalls[i]
      const call2 = recentCalls[i + 1]
      
      if (call1.latitude && call1.longitude && call2.latitude && call2.longitude) {
        const distance = calculateDistance(
          call1.latitude, call1.longitude,
          call2.latitude, call2.longitude
        )
        
        const timeDiff = Math.abs(call1.startTime.getTime() - call2.startTime.getTime()) / (1000 * 60) // minutes
        const speed = distance / (timeDiff / 60) // km/h
        
        // Flag if speed > 500 km/h (impossible without aircraft)
        if (speed > 500) {
          suspiciousMovements.push({
            distance,
            timeDiff: timeDiff,
            speed,
            from: { lat: call2.latitude, lng: call2.longitude },
            to: { lat: call1.latitude, lng: call1.longitude },
          })
        }
      }
    }

    if (suspiciousMovements.length > 0) {
      return {
        type: FraudAlertType.LOCATION_ANOMALY,
        severity: suspiciousMovements.length > 2 ? 'HIGH' : 'MEDIUM',
        title: 'Impossible Travel Pattern Detected',
        description: 'Subscriber appears to have traveled impossible distances in short time',
        riskScore: Math.min(100, suspiciousMovements.length * 30 + 40),
        confidence: 0.88,
        evidence: {
          suspiciousMovements: suspiciousMovements.slice(0, 3), // Top 3
          totalSuspiciousMovements: suspiciousMovements.length,
        },
      }
    }

    return null
  } catch (error) {
    console.error('Location anomaly check failed:', error)
    return null
  }
}

// Device fraud detection
async function checkDeviceFraud(subscriberId: string): Promise<FraudAlert | null> {
  if (!shouldUseRealData()) {
    // Mock device fraud
    const isDeviceFraud = Math.random() > 0.92
    if (isDeviceFraud) {
      return {
        type: FraudAlertType.DEVICE_FRAUD,
        severity: 'HIGH',
        title: 'Multiple Device Usage Detected',
        description: 'Subscriber appears to be using multiple devices simultaneously',
        riskScore: 80,
        confidence: 0.85,
        evidence: {
          uniqueDevices: 5,
          timeWindow: '24 hours',
          simultaneousUsage: true,
        },
      }
    }
    return null
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
      include: {
        callRecords: {
          where: {
            startTime: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
          take: 100,
        },
      },
    })

    if (!subscriber || subscriber.callRecords.length < 10) return null

    // Check for multiple cell towers used simultaneously
    const cellTowerUsage = new Map<string, Date[]>()
    
    subscriber.callRecords.forEach(call => {
      if (call.cellId) {
        if (!cellTowerUsage.has(call.cellId)) {
          cellTowerUsage.set(call.cellId, [])
        }
        cellTowerUsage.get(call.cellId)!.push(call.startTime)
      }
    })

    // Check for simultaneous usage of distant cell towers
    const simultaneousUsage = []
    const cellTowers = Array.from(cellTowerUsage.entries())
    
    for (let i = 0; i < cellTowers.length; i++) {
      for (let j = i + 1; j < cellTowers.length; j++) {
        const [cellId1, times1] = cellTowers[i]
        const [cellId2, times2] = cellTowers[j]
        
        // Check if both towers were used within 5 minutes of each other
        for (const time1 of times1) {
          for (const time2 of times2) {
            const timeDiff = Math.abs(time1.getTime() - time2.getTime()) / (1000 * 60)
            if (timeDiff < 5) {
              simultaneousUsage.push({
                cellId1,
                cellId2,
                timeDiff,
                time1,
                time2,
              })
            }
          }
        }
      }
    }

    if (simultaneousUsage.length > 0) {
      return {
        type: FraudAlertType.DEVICE_FRAUD,
        severity: simultaneousUsage.length > 3 ? 'CRITICAL' : 'HIGH',
        title: 'Simultaneous Device Usage Detected',
        description: 'Multiple devices appear to be used simultaneously',
        riskScore: Math.min(100, simultaneousUsage.length * 25 + 50),
        confidence: 0.82,
        evidence: {
          simultaneousUsage: simultaneousUsage.slice(0, 3),
          totalIncidents: simultaneousUsage.length,
          uniqueCellTowers: cellTowerUsage.size,
        },
      }
    }

    return null
  } catch (error) {
    console.error('Device fraud check failed:', error)
    return null
  }
}

// Premium rate fraud detection
async function checkPremiumRateFraud(subscriberId: string): Promise<FraudAlert | null> {
  if (!shouldUseRealData()) {
    // Mock premium rate fraud
    const isPremiumFraud = Math.random() > 0.88
    if (isPremiumFraud) {
      return {
        type: FraudAlertType.PREMIUM_RATE_FRAUD,
        severity: 'HIGH',
        title: 'Premium Rate Number Usage',
        description: 'Subscriber has made calls to premium rate numbers',
        riskScore: 75,
        confidence: 0.9,
        evidence: {
          premiumCalls: 12,
          totalCost: 245.50,
          averageCost: 20.46,
        },
      }
    }
    return null
  }

  try {
    const expensiveCalls = await prisma.callRecord.findMany({
      where: {
        subscriberId,
        cost: { gt: 10 }, // Calls costing more than $10
        startTime: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    })

    const totalCost = expensiveCalls.reduce((sum, call) => sum + (call.cost || 0), 0)

    if (totalCost > FRAUD_CONFIG.costThreshold) {
      return {
        type: FraudAlertType.PREMIUM_RATE_FRAUD,
        severity: totalCost > FRAUD_CONFIG.costThreshold * 2 ? 'CRITICAL' : 'HIGH',
        title: 'High Cost Call Pattern Detected',
        description: `Subscriber has incurred $${totalCost.toFixed(2)} in high-cost calls`,
        riskScore: Math.min(100, (totalCost / FRAUD_CONFIG.costThreshold) * 50 + 25),
        confidence: 0.93,
        evidence: {
          expensiveCalls: expensiveCalls.length,
          totalCost,
          averageCost: totalCost / expensiveCalls.length,
          threshold: FRAUD_CONFIG.costThreshold,
        },
      }
    }

    return null
  } catch (error) {
    console.error('Premium rate fraud check failed:', error)
    return null
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Main fraud detection function
export async function detectFraud(subscriberId: string): Promise<FraudDetectionResult> {
  const timer = createTimer()
  
  try {
    // Check cache first
    const cacheKey = `fraud_detection:${subscriberId}`
    const cachedResult = await CacheOperations.getCache(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    const alerts: FraudAlert[] = []

    // Run all fraud detection checks
    const checks = [
      checkVelocityFraud(subscriberId),
      checkLocationAnomaly(subscriberId),
      checkDeviceFraud(subscriberId),
      checkPremiumRateFraud(subscriberId),
    ]

    const results = await Promise.allSettled(checks)
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        alerts.push(result.value)
      } else if (result.status === 'rejected') {
        console.error(`Fraud check ${index} failed:`, result.reason)
      }
    })

    // Calculate overall risk score
    const riskScore = alerts.length > 0 
      ? Math.min(100, alerts.reduce((sum, alert) => sum + alert.riskScore, 0) / alerts.length)
      : Math.random() * 30 // Low random score for clean profiles

    // Determine risk level
    let riskLevel: RiskLevel
    if (riskScore >= 80) riskLevel = RiskLevel.CRITICAL
    else if (riskScore >= 60) riskLevel = RiskLevel.HIGH
    else if (riskScore >= 30) riskLevel = RiskLevel.MEDIUM
    else riskLevel = RiskLevel.LOW

    // Calculate confidence
    const confidence = alerts.length > 0
      ? alerts.reduce((sum, alert) => sum + alert.confidence, 0) / alerts.length
      : 0.95

    const result: FraudDetectionResult = {
      subscriberId,
      riskScore,
      riskLevel,
      confidence,
      alerts,
      evidence: {
        checksPerformed: checks.length,
        alertsGenerated: alerts.length,
        processingTime: timer.end(),
      },
      timestamp: new Date(),
    }

    // Cache result for 5 minutes
    await CacheOperations.setCache(cacheKey, result, 300)

    // Log fraud events
    if (alerts.length > 0) {
      alerts.forEach(alert => {
        logFraudEvent(alert.type, subscriberId, alert.riskScore, alert.confidence, alert.evidence)
      })
    }

    logBusinessEvent('FRAUD_DETECTION', 'subscriber', subscriberId, undefined, {
      riskScore,
      riskLevel,
      alertCount: alerts.length,
    })

    return result

  } catch (error) {
    console.error('Fraud detection failed:', error)
    
    // Return safe default result
    return {
      subscriberId,
      riskScore: 0,
      riskLevel: RiskLevel.LOW,
      confidence: 0,
      alerts: [],
      evidence: { error: 'Detection failed' },
      timestamp: new Date(),
    }
  }
}

// Batch fraud detection for multiple subscribers
export async function batchFraudDetection(subscriberIds: string[]): Promise<FraudDetectionResult[]> {
  const results: FraudDetectionResult[] = []
  
  // Process in batches to avoid overwhelming the system
  const batchSize = 10
  for (let i = 0; i < subscriberIds.length; i += batchSize) {
    const batch = subscriberIds.slice(i, i + batchSize)
    const batchPromises = batch.map(id => detectFraud(id))
    const batchResults = await Promise.allSettled(batchPromises)
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        console.error(`Batch fraud detection failed for ${batch[index]}:`, result.reason)
      }
    })
  }
  
  return results
}

// Export configuration and types
export { FRAUD_CONFIG, FraudDetectionResult, FraudAlert, BehaviorPattern }
