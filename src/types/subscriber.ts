export interface SubscriberOverview {
  msisdn: string
  imsi: string
  currentImei: string
  status: "Active" | "Inactive" | "Suspended" | "Terminated"
  activationDate: string
  lastActivity: string
  currentLocation: {
    cellSite: string
    lac: string
    coordinates: { lat: number; lng: number }
    address: string
  }
  deviceInfo: {
    manufacturer: string
    model: string
    os: string
    imeiHistory: string[]
  }
  subscriptionType: string
  dealerInfo: {
    dealerId: string
    dealerName: string
    location: string
  }
  networkInfo: {
    homeNetwork: string
    currentNetwork: string
    roamingStatus: boolean
  }
}

export interface OverallActivity {
  summary: {
    totalCalls: { outgoing: number; incoming: number }
    totalSms: { sent: number; received: number }
    totalDataSessions: number
    distinctImeis: number
    distinctCellSites: number
    internationalCalls: number
  }
  timeSeries: {
    date: string
    calls: number
    sms: number
    data: number
  }[]
  locationClusters: {
    cellSite: string
    frequency: number
    coordinates: { lat: number; lng: number }
  }[]
  deviceSwitching: {
    date: string
    imei: string
    deviceInfo: string
  }[]
}

export interface LocalCallActivity {
  stats: {
    totalCalls: { outgoing: number; incoming: number }
    avgDuration: number
    totalDuration: number
    uniqueContacts: number
  }
  timeOfDayDistribution: {
    hour: number
    callCount: number
  }[]
  weekdayWeekendSplit: {
    weekday: { calls: number; duration: number }
    weekend: { calls: number; duration: number }
  }
  callLogs: {
    timestamp: string
    type: "outgoing" | "incoming"
    number: string
    duration: number
    cellSite: string
    imei: string
  }[]
}

export interface SmsActivity {
  stats: {
    sent: number
    received: number
    distinctContacts: number
    avgPerDay: number
  }
  peakTimes: {
    hour: number
    count: number
  }[]
  bulkSmsDetection: {
    detected: boolean
    patterns: string[]
    suspiciousCount: number
  }
  smsLogs: {
    timestamp: string
    type: "sent" | "received"
    number: string
    length: number
    imei: string
  }[]
}

export interface InternationalCallActivity {
  stats: {
    totalCalls: number
    totalDuration: number
    distinctCountries: number
    avgDuration: number
  }
  destinations: {
    country: string
    countryCode: string
    calls: number
    duration: number
    riskLevel: "Low" | "Medium" | "High"
  }[]
  callLogs: {
    timestamp: string
    country: string
    number: string
    duration: number
    cost: number
    imei: string
  }[]
}

export interface DataUsage {
  stats: {
    totalSessions: number
    totalVolume: number
    avgSessionDuration: number
    distinctApns: number
  }
  apnUsage: {
    apn: string
    sessions: number
    volume: number
    imeis: string[]
  }[]
  roamingData: {
    country: string
    volume: number
    sessions: number
  }[]
  tetheringChecks: {
    imei: string
    apn: string
    suspiciousActivity: boolean
    reason: string
  }[]
  usageHistory: {
    date: string
    volume: number
    sessions: number
  }[]
}

export interface DealerAssociation {
  dealerInfo: {
    dealerId: string
    dealerName: string
    location: string
    activationDate: string
    activationLocation: {
      cellSite: string
      coordinates: { lat: number; lng: number }
    }
  }
  dealerStats: {
    totalSubscribersActivated: number
    activationsLast30Days: number
    suspiciousActivations: number
  }
  recentActivations: {
    msisdn: string
    activationDate: string
    status: string
    riskFlags: string[]
  }[]
}

export interface RechargePayment {
  stats: {
    last7Days: { count: number; amount: number }
    last30Days: { count: number; amount: number }
    avgRechargeAmount: number
    highValueRecharges: number
  }
  rechargeHistory: {
    timestamp: string
    amount: number
    method: string
    location: string
    isHighValue: boolean
  }[]
  paymentMethods: {
    method: string
    count: number
    totalAmount: number
  }[]
}

// New AI Analysis Interface
export interface AIAnalysis {
  overallRiskScore: number
  behavioralScore: number
  networkScore: number
  deviceScore: number
  velocityScore: number
  confidence: number
  dataQuality: number
  riskFactors: string[]
  anomalies: {
    behavioral: {
      type: string
      severity: "Low" | "Medium" | "High"
      description: string
    }[]
    location: {
      type: string
      severity: "Low" | "Medium" | "High"
      description: string
    }[]
    network: {
      type: string
      severity: "Low" | "Medium" | "High"
      description: string
    }[]
  }
  modelPredictions: {
    model: string
    probability: number
    confidence: number
  }[]
  recommendations: string[]
  lastAnalyzed: string
}

export interface SubscriberData {
  overview: SubscriberOverview
  overallActivity: OverallActivity
  localCallActivity: LocalCallActivity
  smsActivity: SmsActivity
  internationalCallActivity: InternationalCallActivity
  dataUsage: DataUsage
  dealerAssociation: DealerAssociation
  rechargePayment: RechargePayment
  aiAnalysis: AIAnalysis // New AI analysis data
  riskScore: number
  lastUpdated: string
}

export interface FilterState {
  dateRange: {
    from: Date
    to: Date
  }
  locations: string[]
  eventTypes: string[]
}
