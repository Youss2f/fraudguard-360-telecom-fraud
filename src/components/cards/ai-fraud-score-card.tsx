"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  Shield,
  AlertTriangle,
  TrendingUp,
  Zap,
  Eye,
  ChevronDown,
  ChevronUp,
  Activity,
  MapPin,
} from "lucide-react"
import type { AIAnalysis } from "@/types/subscriber"

interface AIFraudScoreCardProps {
  data: AIAnalysis
  subscriberInfo: { msisdn: string; searchType: string }
}

export function AIFraudScoreCard({ data, subscriberInfo }: AIFraudScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  const getRiskLevel = (score: number) => {
    if (score >= 80)
      return {
        level: "Critical",
        color: "destructive",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        icon: AlertTriangle,
      }
    if (score >= 60)
      return {
        level: "High",
        color: "destructive",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        icon: AlertTriangle,
      }
    if (score >= 40)
      return {
        level: "Medium",
        color: "secondary",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        icon: TrendingUp,
      }
    return { level: "Low", color: "default", bgColor: "bg-green-50", textColor: "text-green-700", icon: Shield }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-red-500"
    if (score >= 60) return "bg-red-400"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  const riskInfo = getRiskLevel(data.overallRiskScore)
  const RiskIcon = riskInfo.icon

  return (
    <Card className="w-full border-0 shadow-xl bg-gradient-to-r from-white to-blue-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                AI Fraud Intelligence
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <Zap className="h-3 w-3 mr-1" />
                  Real-time
                </Badge>
              </CardTitle>
              <p className="text-gray-600">Advanced machine learning fraud detection analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDetails ? "Hide" : "Show"} Details
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Risk Score Display */}
        <div
          className={`${riskInfo.bgColor} rounded-2xl p-6 border-2 ${riskInfo.color === "destructive" ? "border-red-200" : riskInfo.color === "secondary" ? "border-yellow-200" : "border-green-200"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <RiskIcon className={`h-8 w-8 ${riskInfo.textColor}`} />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Overall Risk Score</h3>
                <p className={`text-sm ${riskInfo.textColor}`}>AI-powered fraud probability assessment</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">{data.overallRiskScore}%</div>
              <Badge variant={riskInfo.color as "default" | "secondary" | "destructive" | "outline"} className="mt-1">
                {riskInfo.level} Risk
              </Badge>
            </div>
          </div>

          <Progress
            value={data.overallRiskScore}
            className="h-3 mb-4"
            style={{
              background: "rgba(0,0,0,0.1)",
            }}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{data.behavioralScore}%</div>
              <div className="text-xs text-gray-600">Behavioral</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{data.networkScore}%</div>
              <div className="text-xs text-gray-600">Network</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{data.deviceScore}%</div>
              <div className="text-xs text-gray-600">Device</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{data.velocityScore}%</div>
              <div className="text-xs text-gray-600">Velocity</div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Identified Risk Factors
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.riskFactors.map((factor, index) => (
              <Badge key={index} variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                {factor}
              </Badge>
            ))}
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Behavioral Anomalies
            </h4>
            <div className="space-y-2">
              {data.anomalies.behavioral.map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-900">{anomaly.type}</span>
                  <Badge variant="outline" className="text-xs">
                    {anomaly.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              Location Anomalies
            </h4>
            <div className="space-y-2">
              {data.anomalies.location.map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-900">{anomaly.type}</span>
                  <Badge variant="outline" className="text-xs">
                    {anomaly.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Detailed Analysis */}
            <div className="border-t pt-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Detailed AI Analysis</h4>

              {/* Model Predictions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">Fraud Probability Models</h5>
                  {data.modelPredictions.map((prediction, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{prediction.model}</span>
                        <span className="font-medium">{prediction.probability}%</span>
                      </div>
                      <Progress value={prediction.probability} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-gray-800">Confidence Metrics</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Model Confidence</span>
                      <Badge variant="outline">{data.confidence}%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Data Quality</span>
                      <Badge variant="outline">{data.dataQuality}%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Analysis Completeness</span>
                      <Badge variant="outline">98%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Recommendations */}
        {data.overallRiskScore >= 40 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Brain className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="font-semibold mb-2">AI Recommendations</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {data.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
