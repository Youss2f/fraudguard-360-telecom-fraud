import type { SubscriberData, AIAnalysis } from "@/types/subscriber"
import { generateMockData } from "./mock-data"
import { getScenarioByQuery } from "./demo-scenarios"

export function generateMockDataWithAI(
  searchQuery: string,
  searchType: "msisdn" | "imsi",
  dateRange?: { start: Date; end: Date },
): SubscriberData {
  // Check if this is a demo scenario
  const scenario = getScenarioByQuery(searchQuery, searchType)

  // Get base mock data with scenario-specific modifications
  const baseData = generateMockData(searchQuery, searchType, scenario)

  // Generate AI analysis based on the data patterns and scenario
  const aiAnalysis = generateAIAnalysis(baseData, searchQuery, scenario)

  return {
    ...baseData,
    aiAnalysis,
    riskScore: aiAnalysis.overallRiskScore, // Update legacy risk score
  }
}

function generateAIAnalysis(data: any, searchQuery: string, scenario?: any): AIAnalysis {
  // Simulate AI analysis based on data patterns
  const hasInternationalCalls = data.internationalCallActivity.stats.totalCalls > 0
  const hasBulkSMS = data.smsActivity.bulkSmsDetection.detected
  const hasDeviceSwitching = data.overallActivity.deviceSwitching.length > 1
  const hasHighValueRecharges = data.rechargePayment.stats.highValueRecharges > 0
  const hasSuspiciousDealer = data.dealerAssociation.dealerStats.suspiciousActivations > 0

  // Calculate component scores based on scenario
  let behavioralScore = scenario?.riskLevel === "Critical" ? 65 : 15
  let networkScore = scenario?.riskLevel === "Critical" ? 78 : 12
  let deviceScore = scenario?.riskLevel === "Critical" ? 82 : 8
  let velocityScore = scenario?.riskLevel === "Critical" ? 89 : 18

  // Behavioral analysis
  if (hasBulkSMS) behavioralScore += scenario?.riskLevel === "Critical" ? 15 : 5
  if (data.smsActivity.stats.avgPerDay > 100) behavioralScore += scenario?.riskLevel === "Critical" ? 10 : 3
  if (data.localCallActivity?.stats?.totalCalls?.outgoing > 500) behavioralScore += scenario?.riskLevel === "Critical" ? 8 : 2

  // Network analysis
  if (hasInternationalCalls) networkScore += scenario?.riskLevel === "Critical" ? 12 : 3
  if (data.internationalCallActivity.destinations.some((d) => d.riskLevel === "High")) networkScore += scenario?.riskLevel === "Critical" ? 15 : 2
  if (data.overallActivity.summary.distinctCellSites > 50) networkScore += scenario?.riskLevel === "Critical" ? 8 : 1

  // Device analysis
  if (hasDeviceSwitching) deviceScore += scenario?.riskLevel === "Critical" ? 10 : 2
  if (data.dataUsage?.tetheringChecks?.some((t) => t.suspiciousActivity)) deviceScore += scenario?.riskLevel === "Critical" ? 8 : 1
  if (data.overview.deviceInfo.imeiHistory.length > 2) deviceScore += scenario?.riskLevel === "Critical" ? 5 : 1

  // Velocity analysis
  if (data.rechargePayment.stats.last7Days.count > 5) velocityScore += 25
  if (data.overallActivity.summary.totalDataSessions > 3000) velocityScore += 20
  if (hasHighValueRecharges) velocityScore += 30

  // Cap scores at 100
  behavioralScore = Math.min(behavioralScore, 100)
  networkScore = Math.min(networkScore, 100)
  deviceScore = Math.min(deviceScore, 100)
  velocityScore = Math.min(velocityScore, 100)

  // Calculate overall risk score
  const overallRiskScore = Math.round(
    behavioralScore * 0.3 + networkScore * 0.25 + deviceScore * 0.2 + velocityScore * 0.25,
  )

  // Generate risk factors
  const riskFactors = []
  if (hasBulkSMS) riskFactors.push("Bulk SMS Activity")
  if (hasInternationalCalls) riskFactors.push("International Call Pattern")
  if (hasDeviceSwitching) riskFactors.push("Multiple Device Usage")
  if (hasHighValueRecharges) riskFactors.push("High Value Transactions")
  if (hasSuspiciousDealer) riskFactors.push("Suspicious Dealer Association")
  if (data.overallActivity.summary.distinctCellSites > 40) riskFactors.push("High Mobility Pattern")
  if (data.dataUsage.tetheringChecks.some((t) => t.suspiciousActivity)) riskFactors.push("Potential Tethering")

  // Generate anomalies
  const anomalies = {
    behavioral: [
      {
        type: "Unusual SMS Volume",
        severity: hasBulkSMS ? "High" : ("Low" as "High" | "Medium" | "Low"),
        description: "SMS activity exceeds normal patterns",
      },
      {
        type: "Call Pattern Deviation",
        severity:
          data.localCallActivity.stats.totalCalls.outgoing > 400 ? "Medium" : ("Low" as "High" | "Medium" | "Low"),
        description: "Call frequency outside normal range",
      },
    ],
    location: [
      {
        type: "High Mobility",
        severity: data.overallActivity.summary.distinctCellSites > 40 ? "High" : ("Low" as "High" | "Medium" | "Low"),
        description: "Movement across multiple cell sites",
      },
      {
        type: "Location Clustering",
        severity: "Low" as "High" | "Medium" | "Low",
        description: "Activity concentrated in specific areas",
      },
    ],
    network: [
      {
        type: "International Activity",
        severity: hasInternationalCalls ? "Medium" : ("Low" as "High" | "Medium" | "Low"),
        description: "Calls to international destinations",
      },
      {
        type: "Data Usage Pattern",
        severity: data.dataUsage.stats.totalVolume > 50 ? "Medium" : ("Low" as "High" | "Medium" | "Low"),
        description: "Data consumption analysis",
      },
    ],
  }

  // Generate model predictions
  const modelPredictions = [
    { model: "Behavioral Analysis", probability: behavioralScore, confidence: 85 },
    { model: "Network Pattern Recognition", probability: networkScore, confidence: 92 },
    { model: "Device Fingerprinting", probability: deviceScore, confidence: 78 },
    { model: "Velocity Checks", probability: velocityScore, confidence: 88 },
    { model: "Social Graph Analysis", probability: Math.round(overallRiskScore * 0.8), confidence: 75 },
  ]

  // Generate recommendations
  const recommendations = []
  if (overallRiskScore >= 80) {
    recommendations.push("Immediate account suspension recommended")
    recommendations.push("Escalate to fraud investigation team")
    recommendations.push("Block high-risk transactions")
  } else if (overallRiskScore >= 60) {
    recommendations.push("Enhanced monitoring required")
    recommendations.push("Manual review of recent activities")
    recommendations.push("Implement transaction limits")
  } else if (overallRiskScore >= 40) {
    recommendations.push("Continue automated monitoring")
    recommendations.push("Review international call patterns")
  } else {
    recommendations.push("Standard monitoring sufficient")
    recommendations.push("No immediate action required")
  }

  return {
    overallRiskScore,
    behavioralScore,
    networkScore,
    deviceScore,
    velocityScore,
    confidence: 87,
    dataQuality: 94,
    riskFactors,
    anomalies,
    modelPredictions,
    recommendations,
    lastAnalyzed: new Date().toISOString(),
  }
}
