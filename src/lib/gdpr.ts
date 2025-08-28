import { prisma, shouldUseRealData } from './database'
import { anonymizeData, maskSensitiveData } from './encryption'
import { logBusinessEvent } from './logger'

// GDPR compliance configuration
const GDPR_CONFIG = {
  enableGdpr: process.env.ENABLE_GDPR_COMPLIANCE !== 'false',
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '2555'), // 7 years default
  anonymizationDelay: parseInt(process.env.ANONYMIZATION_DELAY_DAYS || '30'), // 30 days
}

// Data subject rights under GDPR
export enum DataSubjectRights {
  ACCESS = 'access',           // Right to access personal data
  RECTIFICATION = 'rectification', // Right to rectify inaccurate data
  ERASURE = 'erasure',         // Right to be forgotten
  PORTABILITY = 'portability', // Right to data portability
  RESTRICTION = 'restriction', // Right to restrict processing
  OBJECTION = 'objection',     // Right to object to processing
}

// GDPR request status
export enum GdprRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

// Data processing lawful basis
export enum LawfulBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
}

// GDPR request interface
interface GdprRequest {
  id: string
  subscriberId: string
  requestType: DataSubjectRights
  status: GdprRequestStatus
  requestedAt: Date
  completedAt?: Date
  requestedBy: string
  notes?: string
}

// Data export for portability
export async function exportSubscriberData(subscriberId: string, requestedBy: string): Promise<any> {
  if (!shouldUseRealData()) {
    // Mock data export for demo
    return {
      subscriber_id: subscriberId,
      export_date: new Date().toISOString(),
      data: {
        personal_info: '[DEMO_DATA]',
        call_records: '[DEMO_DATA]',
        sms_records: '[DEMO_DATA]',
        data_usage: '[DEMO_DATA]',
      },
      format: 'JSON',
      note: 'This is demo data for showcase purposes'
    }
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
      include: {
        callRecords: true,
        smsRecords: true,
        dataRecords: true,
        fraudAlerts: true,
        riskProfiles: true,
        investigations: true,
      },
    })

    if (!subscriber) {
      throw new Error('Subscriber not found')
    }

    // Log the data export request
    logBusinessEvent('GDPR_DATA_EXPORT', 'subscriber', subscriberId, requestedBy)

    // Structure data for export
    const exportData = {
      export_metadata: {
        subscriber_id: subscriberId,
        export_date: new Date().toISOString(),
        requested_by: requestedBy,
        data_controller: 'FraudGuard 360°',
        format: 'JSON',
      },
      personal_data: {
        basic_info: {
          msisdn: subscriber.msisdn,
          imsi: subscriber.imsi,
          imei: subscriber.imei,
          first_name: subscriber.firstName,
          last_name: subscriber.lastName,
          email: subscriber.email,
          address: subscriber.address,
          date_of_birth: subscriber.dateOfBirth,
          nationality: subscriber.nationality,
          id_number: subscriber.idNumber,
        },
        service_info: {
          network_operator: subscriber.networkOperator,
          plan_type: subscriber.planType,
          activation_date: subscriber.activationDate,
          status: subscriber.status,
        },
        risk_assessment: {
          risk_score: subscriber.riskScore,
          risk_level: subscriber.riskLevel,
          last_risk_update: subscriber.lastRiskUpdate,
        },
      },
      usage_data: {
        call_records: subscriber.callRecords.map(record => ({
          id: record.id,
          call_type: record.callType,
          direction: record.direction,
          calling_number: record.callingNumber,
          called_number: record.calledNumber,
          start_time: record.startTime,
          end_time: record.endTime,
          duration: record.duration,
          cost: record.cost,
          currency: record.currency,
        })),
        sms_records: subscriber.smsRecords.map(record => ({
          id: record.id,
          direction: record.direction,
          sender_number: record.senderNumber,
          receiver_number: record.receiverNumber,
          timestamp: record.timestamp,
        })),
        data_records: subscriber.dataRecords.map(record => ({
          id: record.id,
          session_start: record.sessionStart,
          session_end: record.sessionEnd,
          bytes_up: record.bytesUp.toString(),
          bytes_down: record.bytesDown.toString(),
        })),
      },
      fraud_data: {
        alerts: subscriber.fraudAlerts.map(alert => ({
          id: alert.id,
          alert_type: alert.alertType,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          risk_score: alert.riskScore,
          confidence: alert.confidence,
          status: alert.status,
          created_at: alert.createdAt,
        })),
        risk_profiles: subscriber.riskProfiles.map(profile => ({
          id: profile.id,
          profile_date: profile.profileDate,
          velocity_score: profile.velocityScore,
          location_score: profile.locationScore,
          behavior_score: profile.behaviorScore,
          device_score: profile.deviceScore,
        })),
      },
      investigations: subscriber.investigations.map(investigation => ({
        id: investigation.id,
        case_number: investigation.caseNumber,
        title: investigation.title,
        priority: investigation.priority,
        status: investigation.status,
        created_at: investigation.createdAt,
      })),
    }

    return exportData

  } catch (error) {
    console.error('Data export failed:', error)
    throw new Error('Failed to export subscriber data')
  }
}

// Anonymize subscriber data (right to be forgotten)
export async function anonymizeSubscriberData(subscriberId: string, requestedBy: string): Promise<boolean> {
  if (!shouldUseRealData()) {
    // Mock anonymization for demo
    logBusinessEvent('GDPR_ANONYMIZATION', 'subscriber', subscriberId, requestedBy, { mode: 'demo' })
    return true
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
    })

    if (!subscriber) {
      throw new Error('Subscriber not found')
    }

    // Anonymize personal data
    const anonymizedData = anonymizeData(subscriber)

    await prisma.subscriber.update({
      where: { id: subscriberId },
      data: {
        ...anonymizedData,
        // Mark as anonymized
        status: 'TERMINATED',
        updatedAt: new Date(),
      },
    })

    // Log the anonymization
    logBusinessEvent('GDPR_ANONYMIZATION', 'subscriber', subscriberId, requestedBy)

    return true

  } catch (error) {
    console.error('Anonymization failed:', error)
    return false
  }
}

// Check data retention compliance
export async function checkDataRetention(): Promise<any> {
  if (!shouldUseRealData()) {
    return {
      status: 'demo_mode',
      message: 'Data retention check not applicable in demo mode',
    }
  }

  try {
    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() - GDPR_CONFIG.dataRetentionDays)

    // Find old records that should be reviewed for deletion
    const oldSubscribers = await prisma.subscriber.findMany({
      where: {
        createdAt: {
          lt: retentionDate,
        },
        status: {
          in: ['TERMINATED', 'SUSPENDED'],
        },
      },
      select: {
        id: true,
        msisdn: true,
        createdAt: true,
        status: true,
      },
    })

    return {
      status: 'completed',
      retention_period_days: GDPR_CONFIG.dataRetentionDays,
      records_for_review: oldSubscribers.length,
      records: oldSubscribers.map(sub => ({
        id: sub.id,
        msisdn: maskSensitiveData(sub.msisdn, 'phone'),
        created_at: sub.createdAt,
        status: sub.status,
        days_old: Math.floor((Date.now() - sub.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      })),
    }

  } catch (error) {
    console.error('Data retention check failed:', error)
    return {
      status: 'error',
      message: 'Failed to check data retention compliance',
    }
  }
}

// Generate privacy notice
export function generatePrivacyNotice(): any {
  return {
    data_controller: {
      name: 'FraudGuard 360°',
      contact: 'privacy@fraudguard.com',
      dpo_contact: 'dpo@fraudguard.com',
    },
    data_processing: {
      purpose: 'Fraud detection and prevention in telecommunications',
      lawful_basis: LawfulBasis.LEGITIMATE_INTERESTS,
      categories_of_data: [
        'Personal identifiers (MSISDN, IMSI, IMEI)',
        'Communication data (call records, SMS)',
        'Location data (cell tower information)',
        'Usage patterns and behavioral data',
        'Risk assessment scores',
      ],
      retention_period: `${GDPR_CONFIG.dataRetentionDays} days`,
      automated_decision_making: true,
      profiling: true,
    },
    data_subject_rights: [
      'Right to access your personal data',
      'Right to rectify inaccurate data',
      'Right to erasure (right to be forgotten)',
      'Right to restrict processing',
      'Right to data portability',
      'Right to object to processing',
      'Right to withdraw consent',
    ],
    contact_information: {
      email: 'privacy@fraudguard.com',
      phone: '+1-800-PRIVACY',
      address: 'Privacy Office, FraudGuard 360°',
    },
    last_updated: new Date().toISOString(),
  }
}

// Validate consent
export function validateConsent(consentData: any): boolean {
  // Basic consent validation
  return !!(
    consentData &&
    consentData.timestamp &&
    consentData.version &&
    consentData.accepted === true &&
    consentData.ip_address
  )
}

// Check if GDPR compliance is enabled
export function isGdprEnabled(): boolean {
  return GDPR_CONFIG.enableGdpr
}

// Export GDPR configuration
export { GDPR_CONFIG }
