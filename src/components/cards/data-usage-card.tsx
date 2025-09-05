"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wifi,
  Database,
  Globe,
  Smartphone,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  HardDrive,
} from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DataUsage, FilterState } from "@/types/subscriber"

interface DataUsageCardProps {
  data: DataUsage
  filters: FilterState
  onImeiHighlight: (imei: string | null) => void
  highlightedImei: string | null
}

export function DataUsageCard({ data, filters, onImeiHighlight, highlightedImei }: DataUsageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const suspiciousTetheringCount = data.tetheringChecks.filter((check) => check.suspiciousActivity).length

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Data Usage
          </CardTitle>
          <div className="flex items-center gap-2">
            {suspiciousTetheringCount > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Tethering
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="apns">APNs</TabsTrigger>
            <TabsTrigger value="roaming">Roaming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{data.stats.totalSessions}</div>
                <div className="text-sm text-gray-600">Sessions</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <HardDrive className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{data.stats.totalVolume.toFixed(1)} GB</div>
                <div className="text-sm text-gray-600">Total Volume</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Database className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  {formatDuration(data.stats.avgSessionDuration)}
                </div>
                <div className="text-sm text-gray-600">Avg Session</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Wifi className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{data.stats.distinctApns}</div>
                <div className="text-sm text-gray-600">APNs Used</div>
              </div>
            </div>

            {/* Tethering Alert */}
            {suspiciousTetheringCount > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="font-semibold mb-2">Suspicious Tethering Activity Detected</div>
                  <div className="text-sm">
                    {suspiciousTetheringCount} device(s) showing potential tethering behavior. Review required.
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Usage Trend */}
            <div className="space-y-2">
              <h4 className="font-semibold">Data Usage Trend (Last 30 Days)</h4>
              <div className="h-48">
                <ChartContainer
                  config={{
                    volume: { label: "Volume (GB)", color: "hsl(var(--chart-1))" },
                    sessions: { label: "Sessions", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.usageHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="volume"
                        stroke="var(--color-volume)"
                        strokeWidth={2}
                        name="Volume (GB)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="sessions"
                        stroke="var(--color-sessions)"
                        strokeWidth={2}
                        name="Sessions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apns" className="space-y-4">
            {/* APN Usage Chart */}
            <div className="space-y-2">
              <h4 className="font-semibold">Data Usage by APN</h4>
              <div className="h-48">
                <ChartContainer
                  config={{
                    volume: { label: "Volume (GB)", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.apnUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="apn" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="volume" fill="var(--color-volume)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* APN Details */}
            <div className="space-y-2">
              <h4 className="font-semibold">APN Details</h4>
              <div className="space-y-2">
                {data.apnUsage.map((apn) => (
                  <div key={apn.apn} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div>
                      <div className="font-medium font-mono">{apn.apn}</div>
                      <div className="text-sm text-gray-600">
                        {apn.sessions} sessions • {apn.imeis.length} device(s)
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">{apn.volume.toFixed(2)} GB</div>
                      <div className="flex gap-1 mt-1">
                        {apn.imeis.map((imei) => (
                          <Badge
                            key={imei}
                            variant="outline"
                            className={`text-xs cursor-pointer transition-colors ${
                              highlightedImei === imei ? "bg-blue-100 border-blue-300" : "hover:bg-gray-100"
                            }`}
                            onClick={() => onImeiHighlight(highlightedImei === imei ? null : imei)}
                          >
                            {imei.slice(-4)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tethering Checks */}
            {data.tetheringChecks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Tethering Analysis</h4>
                <div className="space-y-2">
                  {data.tetheringChecks.map((check, index) => (
                    <div
                      key={`${check.imei}-${check.apn}`}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        check.suspiciousActivity ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone
                          className={`h-4 w-4 ${check.suspiciousActivity ? "text-yellow-600" : "text-green-600"}`}
                        />
                        <div>
                          <div
                            className={`font-medium font-mono cursor-pointer transition-colors ${
                              highlightedImei === check.imei ? "text-blue-600" : "hover:text-blue-600"
                            }`}
                            onClick={() => onImeiHighlight(highlightedImei === check.imei ? null : check.imei)}
                          >
                            {check.imei}
                          </div>
                          <div className="text-sm text-gray-600">{check.apn}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge variant={check.suspiciousActivity ? "secondary" : "default"} className="mb-1">
                          {check.suspiciousActivity ? "Suspicious" : "Normal"}
                        </Badge>
                        <div className="text-xs text-gray-600">{check.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="roaming" className="space-y-4">
            {data.roamingData.length > 0 ? (
              <>
                <div className="space-y-2">
                  <h4 className="font-semibold">Roaming Data Usage</h4>
                  <div className="space-y-2">
                    {data.roamingData.map((roaming) => (
                      <div
                        key={roaming.country}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium">{roaming.country}</div>
                            <div className="text-sm text-gray-600">{roaming.sessions} sessions</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold">{roaming.volume.toFixed(2)} GB</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">Total Roaming Usage</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.roamingData.reduce((sum, r) => sum + r.volume, 0).toFixed(2)} GB
                  </div>
                  <div className="text-sm text-gray-600">Across {data.roamingData.length} countries</div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No roaming data usage detected</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Daily Usage History</h4>
              <div className="h-48">
                <ChartContainer
                  config={{
                    volume: { label: "Volume (GB)", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.usageHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="volume" fill="var(--color-volume)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Peak Day</div>
                <div className="font-semibold">
                  {data.usageHistory.reduce((max, day) => (day.volume > max.volume ? day : max)).volume.toFixed(2)} GB
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Average Daily</div>
                <div className="font-semibold">
                  {(data.usageHistory.reduce((sum, day) => sum + day.volume, 0) / data.usageHistory.length).toFixed(2)}{" "}
                  GB
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Sessions</div>
                <div className="font-semibold">{data.usageHistory.reduce((sum, day) => sum + day.sessions, 0)}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
