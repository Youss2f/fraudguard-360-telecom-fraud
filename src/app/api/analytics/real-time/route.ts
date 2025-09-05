import { NextResponse } from "next/server"
import { getRealTimeAnalytics } from "@/lib/database"

export async function GET() {
  try {
    // Get real-time analytics data (with database fallback to mock)
    const realTimeData = await getRealTimeAnalytics()

    // Add additional mock data for demo purposes
    const enhancedData = {
      ...realTimeData,
      // Additional demo data for UI
      processing_speed: Math.floor(Math.random() * 500) + 2000,
      false_positive_rate: Math.floor(Math.random() * 5) + 2,
      fraud_trends: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        fraud_attempts: Math.floor(Math.random() * 50) + 10,
        blocked: Math.floor(Math.random() * 40) + 30,
        investigated: Math.floor(Math.random() * 20) + 5,
      })),
      risk_distribution: [
        { name: "Low Risk", value: 65, color: "#10B981" },
        { name: "Medium Risk", value: 25, color: "#F59E0B" },
        { name: "High Risk", value: 8, color: "#EF4444" },
        { name: "Critical", value: 2, color: "#DC2626" },
      ],
      top_fraud_patterns: [
        { pattern: "International Revenue Share", count: 45, trend: "up" },
        { pattern: "Bulk SMS Operations", count: 32, trend: "down" },
        { pattern: "Device Cloning", count: 28, trend: "up" },
        { pattern: "SIM Swapping", count: 19, trend: "stable" },
        { pattern: "Premium Rate Abuse", count: 15, trend: "down" },
      ],
      performance_metrics: {
        cpu_usage: Math.floor(Math.random() * 40) + 30,
        memory_usage: Math.floor(Math.random() * 30) + 40,
        database_load: Math.floor(Math.random() * 50) + 20,
        network_throughput: Math.floor(Math.random() * 30) + 60,
      },
      ai_model_performance: {
        behavioral_model: Math.floor(Math.random() * 10) + 90,
        network_analysis: Math.floor(Math.random() * 15) + 85,
        device_fingerprinting: Math.floor(Math.random() * 12) + 88,
        velocity_checks: Math.floor(Math.random() * 8) + 92,
      },
    }

    return NextResponse.json({
      success: true,
      data: enhancedData,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch real-time analytics",
      },
      { status: 500 }
    )
  }
}
