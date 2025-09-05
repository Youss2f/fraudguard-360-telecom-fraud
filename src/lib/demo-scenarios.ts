// Demo scenarios for showcasing different fraud patterns

export interface DemoScenario {
  id: string
  name: string
  description: string
  searchQuery: string
  searchType: "msisdn" | "imsi"
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  keyFeatures: string[]
  fraudPatterns: string[]
  showcasePoints: string[]
}

export const demoScenarios: DemoScenario[] = [
  {
    id: "high-risk-fraud",
    name: "High-Risk Fraud Detection",
    description: "Subscriber with suspicious international calling patterns and device switching behavior",
    searchQuery: "+1234567890",
    searchType: "msisdn",
    riskLevel: "Critical",
    keyFeatures: [
      "Multiple IMEI usage",
      "High-risk international destinations",
      "Unusual call velocity",
      "Suspicious payment patterns",
    ],
    fraudPatterns: [
      "International Revenue Share Fraud (IRSF)",
      "Device cloning indicators",
      "Premium rate service abuse",
      "Velocity-based fraud",
    ],
    showcasePoints: [
      "AI risk score: 85+ (Critical)",
      "Cross-device correlation",
      "Geospatial analysis",
      "Real-time pattern detection",
    ],
  },
  {
    id: "normal-user",
    name: "Normal User Profile",
    description: "Typical subscriber with normal usage patterns for comparison",
    searchQuery: "+1555123456",
    searchType: "msisdn",
    riskLevel: "Low",
    keyFeatures: [
      "Consistent device usage",
      "Normal call patterns",
      "Regular payment behavior",
      "Stable location patterns",
    ],
    fraudPatterns: [],
    showcasePoints: [
      "Baseline comparison",
      "Normal behavior modeling",
      "Risk score calibration",
      "False positive prevention",
    ],
  },
]

export function getScenarioByQuery(searchQuery: string, searchType: "msisdn" | "imsi"): DemoScenario | undefined {
  return demoScenarios.find((scenario) => scenario.searchQuery === searchQuery && scenario.searchType === searchType)
}

export function getRandomScenario(): DemoScenario {
  const randomIndex = Math.floor(Math.random() * demoScenarios.length)
  return demoScenarios[randomIndex]
}

// Demo tips and insights for each scenario
export const scenarioInsights = {
  "high-risk-fraud": [
    "Notice the AI confidence score and multiple risk factors",
    "Observe IMEI highlighting across different activity cards",
    "Check the international call destinations and risk levels",
    "Review the device switching timeline and patterns",
  ],
  "normal-user": [
    "Compare risk scores with the high-risk scenario",
    "Notice the consistent device and location patterns",
    "Observe normal communication behaviors",
    "Use as baseline for fraud detection calibration",
  ],
}

// Interactive demo prompts
export const demoPrompts = {
  search: [
    "Try searching for different subscriber types:",
    "• +1234567890 (High-risk fraud detection)",
    "• +1555123456 (Normal user profile)",
  ],
  analysis: [
    "Watch the AI analysis progress:",
    "• Multiple ML models running in parallel",
    "• Real-time confidence scoring",
    "• Risk factor identification",
    "• Automated recommendations",
  ],
  interaction: [
    "Try these interactive features:",
    "• Click any IMEI to highlight across cards",
    "• Hover over chart elements for details",
    "• Use date range filters",
    "• Export professional reports",
  ],
  exploration: [
    "Explore different dashboard sections:",
    "• Real-time monitoring with live alerts",
    "• Interactive maps with fraud hotspots",
    "• Case management workflow",
    "• Advanced filtering options",
  ],
}

export function getScenarioPrompts(scenarioId: string): string[] {
  return scenarioInsights[scenarioId as keyof typeof scenarioInsights] || []
}
