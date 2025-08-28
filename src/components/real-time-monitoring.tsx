"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Activity, AlertTriangle, TrendingUp, Users, Globe, Zap, Shield, Eye, Pause, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RealTimeAlert {
  id: string
  type: "fraud" | "anomaly" | "threshold" | "security"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  subscriber: string
  timestamp: string
  status: "new" | "acknowledged" | "resolved"
}

interface SystemMetric {
  name: string
  value: number
  change: number
  status: "normal" | "warning" | "critical"
  icon: React.ReactNode
}

export function RealTimeMonitoring() {
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([
    {
      id: "ALT-001",
      type: "fraud",
      severity: "critical",
      title: "Coordinated Fraud Ring Detected",
      description: "Multiple subscribers showing synchronized suspicious activity",
      subscriber: "+1234567890",
      timestamp: new Date().toISOString(),
      status: "new",
    },
    {
      id: "ALT-002",
      type: "anomaly",
      severity: "high",
      title: "Unusual Data Usage Pattern",
      description: "Subscriber exceeded normal data usage by 500%",
      subscriber: "+1234567891",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "ALT-003",
      type: "threshold",
      severity: "medium",
      title: "International Call Threshold Exceeded",
      description: "Subscriber made 50+ international calls in 1 hour",
      subscriber: "+1234567892",
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      status: "acknowledged",
    },
  ])

  const [systemMetrics] = useState<SystemMetric[]>([
    {
      name: "Active Subscribers",
      value: 1247893,
      change: 2.3,
      status: "normal",
      icon: <Users className="h-4 w-4" />,
    },
    {
      name: "Fraud Detection Rate",
      value: 94.7,
      change: 1.2,
      status: "normal",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      name: "System Load",
      value: 67.3,
      change: -3.1,
      status: "normal",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      name: "Alert Response Time",
      value: 2.4,
      change: -12.5,
      status: "normal",
      icon: <Zap className="h-4 w-4" />,
    },
  ])

  const [activityData, setActivityData] = useState([
    { time: "00:00", calls: 1200, sms: 3400, data: 890, alerts: 12 },
    { time: "04:00", calls: 800, sms: 2100, data: 650, alerts: 8 },
    { time: "08:00", calls: 2100, sms: 4800, data: 1200, alerts: 15 },
    { time: "12:00", calls: 2800, sms: 5200, data: 1450, alerts: 22 },
    { time: "16:00", calls: 2400, sms: 4600, data: 1300, alerts: 18 },
    { time: "20:00", calls: 1900, sms: 3800, data: 1100, alerts: 14 },
    { time: "23:59", calls: 1400, sms: 2900, data: 950, alerts: 10 },
  ])

  // Simulate real-time updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      // Update activity data
      setActivityData((prev) => {
        const newData = [...prev]
        const lastEntry = newData[newData.length - 1]
        const newTime = new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })

        newData.push({
          time: newTime,
          calls: Math.floor(Math.random() * 1000) + 1500,
          sms: Math.floor(Math.random() * 2000) + 3000,
          data: Math.floor(Math.random() * 500) + 800,
          alerts: Math.floor(Math.random() * 15) + 5,
        })

        return newData.slice(-20) // Keep last 20 entries
      })

      // Occasionally add new alerts
      if (Math.random() < 0.1) {
        const newAlert: RealTimeAlert = {
          id: `ALT-${Date.now()}`,
          type: ["fraud", "anomaly", "threshold", "security"][Math.floor(Math.random() * 4)] as any,
          severity: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as any,
          title: "New Suspicious Activity Detected",
          description: "Real-time monitoring detected potential fraud pattern",
          subscriber: `+123456${Math.floor(Math.random() * 10000)}`,
          timestamp: new Date().toISOString(),
          status: "new",
        }
        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]) // Keep last 10 alerts
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "default"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fraud":
        return <AlertTriangle className="h-4 w-4" />
      case "anomaly":
        return <TrendingUp className="h-4 w-4" />
      case "threshold":
        return <Activity className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, status: "acknowledged" } : alert)))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Real-Time Monitoring</h2>
          <p className="text-gray-600 dark:text-gray-400">Live fraud detection and system monitoring</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isMonitoring ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            ></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{isMonitoring ? "Live" : "Paused"}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsMonitoring(!isMonitoring)}>
            {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isMonitoring ? "Pause" : "Resume"}
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.name}</span>
                </div>
                <Badge variant={metric.status === "normal" ? "default" : "destructive"} className="text-xs">
                  {metric.status}
                </Badge>
              </div>

              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {metric.name.includes("Rate") || metric.name.includes("Load")
                    ? `${metric.value}%`
                    : metric.name.includes("Time")
                      ? `${metric.value}s`
                      : metric.value.toLocaleString()}
                </div>
                <div className={`text-xs ${metric.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {metric.change >= 0 ? "+" : ""}
                  {metric.change}% from last hour
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ChartContainer
              config={{
                calls: { label: "Calls", color: "hsl(var(--chart-1))" },
                sms: { label: "SMS", color: "hsl(var(--chart-2))" },
                data: { label: "Data Sessions", color: "hsl(var(--chart-3))" },
                alerts: { label: "Alerts", color: "hsl(var(--chart-4))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stackId="1"
                    stroke="var(--color-calls)"
                    fill="var(--color-calls)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="sms"
                    stackId="1"
                    stroke="var(--color-sms)"
                    fill="var(--color-sms)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="data"
                    stackId="1"
                    stroke="var(--color-data)"
                    fill="var(--color-data)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Live Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Live Alerts
              {alerts.filter((a) => a.status === "new").length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alerts.filter((a) => a.status === "new").length} New
                </Badge>
              )}
            </CardTitle>
            <Button variant="outline" size="sm">
              View All Alerts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg transition-all ${
                  alert.status === "new"
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getTypeIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Subscriber: {alert.subscriber}</span>
                        <span>•</span>
                        <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span className="capitalize">{alert.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {alert.status === "new" && (
                      <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>
                        Acknowledge
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active alerts. System is running normally.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Network Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Network Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Call Success Rate</span>
                <span className="text-sm font-medium">98.7%</span>
              </div>
              <Progress value={98.7} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS Delivery Rate</span>
                <span className="text-sm font-medium">99.2%</span>
              </div>
              <Progress value={99.2} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Session Success</span>
                <span className="text-sm font-medium">97.4%</span>
              </div>
              <Progress value={97.4} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Processing Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.3M</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Events/Hour</div>
              </div>

              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">847</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Fraud Detected</div>
              </div>

              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">1.2s</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Avg Response</div>
              </div>

              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">99.8%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
