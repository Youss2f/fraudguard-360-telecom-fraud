"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageSquare,
  Wifi,
} from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { OverallActivity, FilterState } from "@/types/subscriber"

interface OverallActivityCardProps {
  data: OverallActivity
  filters: FilterState
  onImeiHighlight: (imei: string | null) => void
  highlightedImei: string | null
}

export function OverallActivityCard({ data, filters, onImeiHighlight, highlightedImei }: OverallActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall Activity
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Phone className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {data.summary.totalCalls.outgoing + data.summary.totalCalls.incoming}
                </div>
                <div className="text-sm text-gray-600">Total Calls</div>
                <div className="text-xs text-gray-500">
                  {data.summary.totalCalls.outgoing} out / {data.summary.totalCalls.incoming} in
                </div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {data.summary.totalSms.sent + data.summary.totalSms.received}
                </div>
                <div className="text-sm text-gray-600">Total SMS</div>
                <div className="text-xs text-gray-500">
                  {data.summary.totalSms.sent} sent / {data.summary.totalSms.received} received
                </div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Wifi className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{data.summary.totalDataSessions}</div>
                <div className="text-sm text-gray-600">Data Sessions</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{data.summary.internationalCalls}</div>
                <div className="text-sm text-gray-600">Intl Calls</div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Distinct IMEIs</span>
                </div>
                <Badge variant="secondary">{data.summary.distinctImeis}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Cell Sites</span>
                </div>
                <Badge variant="secondary">{data.summary.distinctCellSites}</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="h-64">
              <ChartContainer
                config={{
                  calls: { label: "Calls", color: "hsl(var(--chart-1))" },
                  sms: { label: "SMS", color: "hsl(var(--chart-2))" },
                  data: { label: "Data Sessions", color: "hsl(var(--chart-3))" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="calls" stroke="var(--color-calls)" strokeWidth={2} name="Calls" />
                    <Line type="monotone" dataKey="sms" stroke="var(--color-sms)" strokeWidth={2} name="SMS" />
                    <Line
                      type="monotone"
                      dataKey="data"
                      stroke="var(--color-data)"
                      strokeWidth={2}
                      name="Data Sessions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Top Cell Sites</h4>
              {data.locationClusters.slice(0, 5).map((location, index) => (
                <div key={location.cellSite} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{location.cellSite}</div>
                      <div className="text-xs text-gray-500">
                        {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{location.frequency} visits</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Device Switching History</h4>
              {data.deviceSwitching.map((device, index) => (
                <div
                  key={`${device.imei}-${device.date}`}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    highlightedImei === device.imei
                      ? "bg-blue-100 border border-blue-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => onImeiHighlight(highlightedImei === device.imei ? null : device.imei)}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="font-medium">{device.deviceInfo}</div>
                      <div className="text-xs text-gray-500 font-mono">{device.imei}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{new Date(device.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(device.date).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
