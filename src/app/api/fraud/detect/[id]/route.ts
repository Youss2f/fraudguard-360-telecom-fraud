import { NextRequest, NextResponse } from "next/server"
import { withSecurity, validateInput, ValidationSchemas } from "@/lib/security"
import { detectFraud } from "@/lib/fraud-detection"
import { logRequest, logResponse, logBusinessEvent, createTimer } from "@/lib/logger"

async function fraudDetectionHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const timer = createTimer()
  const requestData = logRequest(request, {
    operation: "fraud_detection",
    subscriberId: params.id,
  })

  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    // Validate subscriber ID
    const validation = validateInput(ValidationSchemas.subscriberSearch, {
      id,
      type: "msisdn",
    })

    if (!validation.success) {
      const duration = timer.end()
      logResponse(requestData, 400, duration, { error: "validation_failed" })

      return NextResponse.json(
        {
          success: false,
          error: "Invalid subscriber ID",
          details: validation.error,
        },
        { status: 400 }
      )
    }

    // Perform fraud detection
    const fraudResult = await detectFraud(id)

    // Log the fraud detection event
    logBusinessEvent("FRAUD_DETECTION_REQUEST", "subscriber", id, undefined, {
      riskScore: fraudResult.riskScore,
      riskLevel: fraudResult.riskLevel,
      alertCount: fraudResult.alerts.length,
      forceRefresh,
    })

    const duration = timer.end()

    const response = {
      success: true,
      data: {
        subscriber_id: id,
        fraud_analysis: {
          risk_score: fraudResult.riskScore,
          risk_level: fraudResult.riskLevel,
          confidence: fraudResult.confidence,
          analysis_timestamp: fraudResult.timestamp,
          processing_time_ms: duration,
        },
        alerts: fraudResult.alerts.map((alert) => ({
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          risk_score: alert.riskScore,
          confidence: alert.confidence,
          evidence: alert.evidence,
        })),
        evidence: fraudResult.evidence,
        recommendations: generateRecommendations(fraudResult),
        metadata: {
          detection_engine_version: "1.0.0",
          checks_performed: ["velocity_analysis", "location_anomaly", "device_fraud", "premium_rate_fraud"],
          data_source: process.env.ENABLE_REAL_DATA === "true" ? "database" : "mock",
        },
      },
    }

    logResponse(requestData, 200, duration, {
      subscriberId: id,
      riskScore: fraudResult.riskScore,
      alertCount: fraudResult.alerts.length,
    })

    return NextResponse.json(response)
  } catch (error) {
    const duration = timer.end()
    logResponse(requestData, 500, duration, {
      error: "fraud_detection_failed",
      subscriberId: params.id,
    })

    return NextResponse.json(
      {
        success: false,
        error: "Fraud detection failed",
        details: error instanceof Error ? error.message : "Unknown error",
        subscriber_id: params.id,
      },
      { status: 500 }
    )
  }
}

// Generate recommendations based on fraud detection results
function generateRecommendations(fraudResult: any): string[] {
  const recommendations: string[] = []

  if (fraudResult.riskScore >= 80) {
    recommendations.push("IMMEDIATE ACTION: Suspend account pending investigation")
    recommendations.push("Contact subscriber to verify recent activity")
    recommendations.push("Review all transactions in the last 24 hours")
  } else if (fraudResult.riskScore >= 60) {
    recommendations.push("Monitor account closely for next 48 hours")
    recommendations.push("Consider temporary spending limits")
    recommendations.push("Flag for manual review")
  } else if (fraudResult.riskScore >= 30) {
    recommendations.push("Add to watchlist for monitoring")
    recommendations.push("Review activity patterns weekly")
  } else {
    recommendations.push("Continue normal monitoring")
    recommendations.push("Account appears to have normal usage patterns")
  }

  // Alert-specific recommendations
  fraudResult.alerts.forEach((alert: any) => {
    switch (alert.type) {
      case "VELOCITY_FRAUD":
        recommendations.push("Implement velocity controls to limit call frequency")
        break
      case "LOCATION_ANOMALY":
        recommendations.push("Verify subscriber travel patterns and location")
        break
      case "DEVICE_FRAUD":
        recommendations.push("Check for unauthorized device access")
        break
      case "PREMIUM_RATE_FRAUD":
        recommendations.push("Block access to premium rate numbers")
        break
    }
  })

  return [...new Set(recommendations)] // Remove duplicates
}

// Apply security middleware
export const GET = withSecurity(fraudDetectionHandler)
