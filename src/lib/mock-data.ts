import { SubscriberData } from "@/types/subscriber"
import type { DemoScenario } from "./demo-scenarios"

export function generateMockData(
  searchQuery: string,
  searchType: "msisdn" | "imsi",
  scenario?: DemoScenario
): SubscriberData {
  const msisdn = searchType === "msisdn" ? searchQuery : "+1234567890"
  const imsi = searchType === "imsi" ? searchQuery : "310150123456789"

  // Determine if this is a high-risk scenario
  const isHighRisk = scenario?.riskLevel === "Critical"
  const isNormalUser = scenario?.id === "normal-user"

  // Generate realistic IMEI numbers based on scenario
  const imeis = isHighRisk
    ? [
        "356938035643809",
        "490154203237518",
        "357240051111110",
        "864398030123456", // Additional suspicious devices for high-risk
        "352094087654321",
      ]
    : [
        "356938035643809", // Single device for normal user
      ]

  const currentImei = imeis[0]

  return {
    overview: {
      msisdn,
      imsi,
      currentImei,
      status: "Active",
      activationDate: "2023-03-15T10:30:00Z",
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      currentLocation: {
        cellSite: "NYC_001_A",
        lac: "1234",
        coordinates: { lat: 40.7128, lng: -74.006 },
        address: "Manhattan, New York, NY",
      },
      deviceInfo: {
        manufacturer: "Apple",
        model: "iPhone 14 Pro",
        os: "iOS 17.1",
        imeiHistory: imeis,
      },
      subscriptionType: "Postpaid Premium",
      dealerInfo: {
        dealerId: "DLR_NYC_001",
        dealerName: "Metro Mobile Store",
        location: "123 Broadway, New York, NY",
      },
      networkInfo: {
        homeNetwork: "Verizon",
        currentNetwork: "Verizon",
        roamingStatus: false,
      },
    },
    overallActivity: {
      summary: isHighRisk
        ? {
            totalCalls: { outgoing: 1247, incoming: 892 },
            totalSms: { sent: 3456, received: 2134 },
            totalDataSessions: 8934,
            distinctImeis: 5,
            distinctCellSites: 127,
            internationalCalls: 234,
          }
        : {
            totalCalls: { outgoing: 156, incoming: 143 },
            totalSms: { sent: 234, received: 198 },
            totalDataSessions: 567,
            distinctImeis: 1,
            distinctCellSites: 12,
            internationalCalls: 2,
          },
      timeSeries: generateTimeSeriesData(),
      locationClusters: [
        { cellSite: "NYC_001_A", frequency: 45, coordinates: { lat: 40.7128, lng: -74.006 } },
        { cellSite: "NYC_002_B", frequency: 32, coordinates: { lat: 40.7589, lng: -73.9851 } },
        { cellSite: "NYC_003_C", frequency: 28, coordinates: { lat: 40.6892, lng: -74.0445 } },
        { cellSite: "BRK_001_A", frequency: 15, coordinates: { lat: 40.6782, lng: -73.9442 } },
      ],
      deviceSwitching: isHighRisk
        ? [
            { date: "2024-01-15T14:30:00Z", imei: imeis[1], deviceInfo: "Samsung Galaxy S23" },
            { date: "2024-01-10T09:15:00Z", imei: imeis[2], deviceInfo: "Google Pixel 7" },
            { date: "2024-01-05T11:22:00Z", imei: imeis[3], deviceInfo: "OnePlus 11" },
            { date: "2023-12-28T08:45:00Z", imei: imeis[4], deviceInfo: "Xiaomi 13 Pro" },
            { date: "2023-12-20T16:45:00Z", imei: imeis[0], deviceInfo: "iPhone 14 Pro" },
          ]
        : [],
    },
    localCallActivity: {
      stats: isHighRisk
        ? {
            totalCalls: { outgoing: 1013, incoming: 834 },
            avgDuration: 187,
            totalDuration: 345678,
            uniqueContacts: 456,
          }
        : {
            totalCalls: { outgoing: 143, incoming: 127 },
            avgDuration: 156,
            totalDuration: 42156,
            uniqueContacts: 34,
          },
      timeOfDayDistribution: generateHourlyDistribution(),
      weekdayWeekendSplit: isHighRisk
        ? {
            weekday: { calls: 1421, duration: 278543 },
            weekend: { calls: 426, duration: 67135 },
          }
        : {
            weekday: { calls: 198, duration: 30876 },
            weekend: { calls: 72, duration: 11280 },
          },
      callLogs: generateCallLogs(imeis),
    },
    smsActivity: {
      stats: isHighRisk
        ? {
            sent: 3456,
            received: 2134,
            distinctContacts: 892,
            avgPerDay: 234,
          }
        : {
            sent: 234,
            received: 198,
            distinctContacts: 45,
            avgPerDay: 12,
          },
      peakTimes: generateSmsHourlyDistribution(),
      bulkSmsDetection: {
        detected: isHighRisk,
        patterns: isHighRisk ? ["Bulk promotional messages", "Spam campaigns", "Automated messaging"] : [],
        suspiciousCount: isHighRisk ? 156 : 0,
      },
      smsLogs: generateSmsLogs(imeis),
    },
    internationalCallActivity: {
      stats: isHighRisk
        ? {
            totalCalls: 234,
            totalDuration: 18947,
            distinctCountries: 23,
            avgDuration: 81,
          }
        : {
            totalCalls: 2,
            totalDuration: 156,
            distinctCountries: 2,
            avgDuration: 78,
          },
      destinations: isHighRisk
        ? [
            { country: "Somalia", countryCode: "+252", calls: 45, duration: 3456, riskLevel: "High" },
            { country: "Premium Services", countryCode: "+882", calls: 38, duration: 2987, riskLevel: "High" },
            { country: "Nigeria", countryCode: "+234", calls: 34, duration: 2876, riskLevel: "Medium" },
            { country: "Afghanistan", countryCode: "+93", calls: 28, duration: 2234, riskLevel: "High" },
            { country: "Syria", countryCode: "+963", calls: 23, duration: 1987, riskLevel: "High" },
            { country: "Pakistan", countryCode: "+92", calls: 19, duration: 1654, riskLevel: "Medium" },
            { country: "Bangladesh", countryCode: "+880", calls: 15, duration: 1234, riskLevel: "Medium" },
            { country: "India", countryCode: "+91", calls: 12, duration: 987, riskLevel: "Low" },
            { country: "Canada", countryCode: "+1", calls: 8, duration: 623, riskLevel: "Low" },
            { country: "United Kingdom", countryCode: "+44", calls: 5, duration: 412, riskLevel: "Low" },
          ]
        : [
            { country: "Canada", countryCode: "+1", calls: 1, duration: 89, riskLevel: "Low" },
            { country: "United Kingdom", countryCode: "+44", calls: 1, duration: 67, riskLevel: "Low" },
          ],
      callLogs: generateInternationalCallLogs(imeis),
    },
    dataUsage: {
      stats: isHighRisk
        ? {
            totalSessions: 8934,
            totalVolume: 156.7, // GB
            avgSessionDuration: 45,
            distinctApns: 6,
          }
        : {
            totalSessions: 567,
            totalVolume: 12.3, // GB
            avgSessionDuration: 18,
            distinctApns: 2,
          },
      apnUsage: isHighRisk
        ? [
            {
              apn: "internet.vzw",
              sessions: 4567,
              volume: 89.2,
              imeis: [imeis[0], imeis[1] || imeis[0], imeis[2] || imeis[0]],
            },
            { apn: "vzwinternet", sessions: 2341, volume: 34.8, imeis: [imeis[0], imeis[3] || imeis[0]] },
            { apn: "vzwapp", sessions: 1234, volume: 18.4, imeis: [imeis[2] || imeis[0], imeis[4] || imeis[0]] },
            { apn: "vzwims", sessions: 567, volume: 8.3, imeis: [imeis[0]] },
            { apn: "vzwtether", sessions: 156, volume: 4.2, imeis: [imeis[1] || imeis[0]] },
            { apn: "vzwproxy", sessions: 69, volume: 1.8, imeis: [imeis[3] || imeis[0]] },
          ]
        : [
            { apn: "internet.vzw", sessions: 456, volume: 10.2, imeis: [imeis[0]] },
            { apn: "vzwinternet", sessions: 111, volume: 2.1, imeis: [imeis[0]] },
          ],
      roamingData: [
        { country: "Canada", volume: 2.3, sessions: 45 },
        { country: "Mexico", volume: 0.8, sessions: 12 },
      ],
      tetheringChecks: isHighRisk
        ? [
            {
              imei: imeis[1] || imeis[0],
              apn: "internet.vzw",
              suspiciousActivity: true,
              reason: "High data usage pattern",
            },
            { imei: imeis[2] || imeis[0], apn: "vzwtether", suspiciousActivity: true, reason: "Tethering detected" },
            { imei: imeis[3] || imeis[0], apn: "vzwproxy", suspiciousActivity: true, reason: "Proxy usage detected" },
            { imei: imeis[0], apn: "vzwinternet", suspiciousActivity: false, reason: "Normal usage" },
          ]
        : [{ imei: imeis[0], apn: "internet.vzw", suspiciousActivity: false, reason: "Normal usage" }],
      usageHistory: generateDataUsageHistory(),
    },
    dealerAssociation: {
      dealerInfo: {
        dealerId: "DLR_NYC_001",
        dealerName: "Metro Mobile Store",
        location: "123 Broadway, New York, NY",
        activationDate: "2023-03-15T10:30:00Z",
        activationLocation: {
          cellSite: "NYC_001_A",
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
      },
      dealerStats: {
        totalSubscribersActivated: 1247,
        activationsLast30Days: 89,
        suspiciousActivations: 12,
      },
      recentActivations: [
        { msisdn: "+1234567891", activationDate: "2024-01-20T14:30:00Z", status: "Active", riskFlags: [] },
        {
          msisdn: "+1234567892",
          activationDate: "2024-01-19T11:15:00Z",
          status: "Active",
          riskFlags: ["Bulk activation"],
        },
        {
          msisdn: "+1234567893",
          activationDate: "2024-01-18T16:45:00Z",
          status: "Suspended",
          riskFlags: ["Suspicious documents"],
        },
      ],
    },
    rechargePayment: {
      stats: {
        last7Days: { count: 3, amount: 75 },
        last30Days: { count: 12, amount: 340 },
        avgRechargeAmount: 28.33,
        highValueRecharges: 2,
      },
      rechargeHistory: generateRechargeHistory(),
      paymentMethods: [
        { method: "Credit Card", count: 8, totalAmount: 240 },
        { method: "Cash", count: 3, totalAmount: 75 },
        { method: "Bank Transfer", count: 1, totalAmount: 25 },
      ],
    },
    aiAnalysis: {
      overallRiskScore: 35,
      behavioralScore: 30,
      networkScore: 25,
      deviceScore: 40,
      velocityScore: 45,
      confidence: 78,
      riskFactors: ["Normal usage patterns"],
      recommendations: ["Continue monitoring"],
      modelPredictions: [
        { model: "Behavioral Analysis", probability: 30, confidence: 78 },
        { model: "Network Analysis", probability: 25, confidence: 82 },
        { model: "Device Analysis", probability: 40, confidence: 75 },
      ],
      dataQuality: 95,
      anomalies: {
        behavioral: [],
        location: [],
        network: []
      },
      lastAnalyzed: new Date().toISOString(),
    },
    riskScore: 35,
    lastUpdated: new Date().toISOString(),
  }
}

function generateTimeSeriesData() {
  const data = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split("T")[0],
      calls: Math.floor(Math.random() * 25) + 5,
      sms: Math.floor(Math.random() * 50) + 10,
      data: Math.floor(Math.random() * 100) + 20,
    })
  }
  return data
}

function generateHourlyDistribution() {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    callCount: Math.floor(Math.random() * 30) + (hour >= 9 && hour <= 17 ? 20 : 5),
  }))
}

function generateSmsHourlyDistribution() {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: Math.floor(Math.random() * 30) + (hour >= 9 && hour <= 17 ? 20 : 5),
  }))
}

function generateCallLogs(imeis: string[]) {
  const logs = []
  for (let i = 0; i < 50; i++) {
    const date = new Date()
    date.setHours(date.getHours() - Math.floor(Math.random() * 168)) // Last week
    logs.push({
      timestamp: date.toISOString(),
      type: Math.random() > 0.5 ? "outgoing" : ("incoming" as "outgoing" | "incoming"),
      number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      duration: Math.floor(Math.random() * 600) + 30,
      cellSite: `NYC_${String(Math.floor(Math.random() * 10) + 1).padStart(3, "0")}_${["A", "B", "C"][Math.floor(Math.random() * 3)]}`,
      imei: imeis[Math.floor(Math.random() * imeis.length)],
    })
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generateSmsLogs(imeis: string[]) {
  const logs = []
  for (let i = 0; i < 100; i++) {
    const date = new Date()
    date.setHours(date.getHours() - Math.floor(Math.random() * 168))
    logs.push({
      timestamp: date.toISOString(),
      type: Math.random() > 0.5 ? "sent" : ("received" as "sent" | "received"),
      number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      length: Math.floor(Math.random() * 160) + 10,
      imei: imeis[Math.floor(Math.random() * imeis.length)],
    })
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generateInternationalCallLogs(imeis: string[]) {
  const countries = [
    { name: "Canada", code: "+1" },
    { name: "United Kingdom", code: "+44" },
    { name: "Nigeria", code: "+234" },
    { name: "India", code: "+91" },
    { name: "Somalia", code: "+252" },
    { name: "Pakistan", code: "+92" },
  ]

  const logs = []
  for (let i = 0; i < 23; i++) {
    const date = new Date()
    date.setHours(date.getHours() - Math.floor(Math.random() * 720)) // Last month
    const country = countries[Math.floor(Math.random() * countries.length)]
    logs.push({
      timestamp: date.toISOString(),
      country: country.name,
      number: `${country.code}${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      duration: Math.floor(Math.random() * 300) + 30,
      cost: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
      imei: imeis[Math.floor(Math.random() * imeis.length)],
    })
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generateDataUsageHistory() {
  const data = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split("T")[0],
      volume: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
      sessions: Math.floor(Math.random() * 150) + 50,
    })
  }
  return data
}

function generateRechargeHistory() {
  const history = []
  const methods = ["Credit Card", "Cash", "Bank Transfer"]

  for (let i = 0; i < 12; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    const amount = [10, 25, 50, 100][Math.floor(Math.random() * 4)]
    history.push({
      timestamp: date.toISOString(),
      amount,
      method: methods[Math.floor(Math.random() * methods.length)],
      location: "Metro Mobile Store, NYC",
      isHighValue: amount >= 50,
    })
  }
  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
