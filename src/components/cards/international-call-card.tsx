"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Phone, Clock, DollarSign, AlertTriangle, ChevronDown, ChevronUp, MapPin, TrendingUp } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { InternationalCallActivity, FilterState } from "@/types/subscriber"

interface InternationalCallCardProps {
  data: InternationalCallActivity
  filters: FilterState
  onImeiHighlight: (imei: string | null) => void
  highlightedImei: string | null
}

export function InternationalCallCard({ data, filters, onImeiHighlight, highlightedImei }: InternationalCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "destructive"
      case "Medium":
        return "secondary"
      default:
        return "default"
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    if (riskLevel === "High") {
      return <AlertTriangle className="h-3 w-3" />
    }
    return null
  }

  const highRiskDestinations = data.destinations.filter(d => d.riskLevel === "High")

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            International Calls
          </CardTitle>
          <div className="flex items-center gap-2">
            {highRiskDestinations.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                High Risk
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
            <TabsTrigger value="logs">Call Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Phone className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {data.stats.totalCalls}
                </div>
                <div className="text-sm text-gray-600">Total Calls</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {formatDuration(data.stats.totalDuration)}
                </div>
                <div className="text-sm text-gray-600">Total Duration</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  {data.stats.distinctCountries}
                </div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">
                  {formatDuration(data.stats.avgDuration)}
                </div>
                <div className="text-sm text-gray-600">Avg Duration</div>
              </div>
            </div>

            {/* High Risk Alert */}
            {highRiskDestinations.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-semibold text-red-800">High Risk Destinations Detected</span>
                </div>
                <div className="text-sm text-red-700">
                  Calls made to {highRiskDestinations.length} high-risk countries. Review required.
                </div>
              </div>
            )}

            {/* Total Cost Estimate */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Estimated Total Cost</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  ${data.callLogs.reduce((sum, call) => sum + call.cost, 0).toFixed(2)}
                </Badge>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="destinations" className="space-y-4">
            {/* Destinations Chart */}
            <div className="space-y-2">
              <h4 className="font-semibold">Calls by Destination</h4>
              <div className="h-48">
                <ChartContainer
                  config={{
                    calls: { label: "Calls", color: "hsl(var(--chart-1))" }
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.destinations} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="country" type="category" width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="calls" fill="var(--color-calls)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Destinations List */}
            <div className="space-y-2">
              <h4 className="font-semibold">Destination Details</h4>
              <div className="space-y-2">
                {data.destinations.map((destination) => (
                  <div key={destination.country} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{destination.country}</span>
                        <Badge variant={getRiskColor(destination.riskLevel)} className="flex items-center gap-1">
                          {getRiskIcon(destination.riskLevel)}
                          {destination.riskLevel}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500 font-mono">{destination.countryCode}</span>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">{destination.calls} calls</div>
                      <div className="text-sm text-gray-600">{formatDuration(destination.duration)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">International Call Logs</h4>
                <Badge variant="outline">{data.callLogs.length} records</Badge>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {data.callLogs.map((call, index) => {
                  const destination = data.destinations.find(d => d.country === call.country)
                  return (
                    <div 
                      key={`${call.timestamp}-${call.number}`}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        highlightedImei === call.imei 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-600" />
                          {destination && destination.riskLevel === "High" && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{call.country}</div>
                          <div className="text-sm font-mono text-gray-600">{call.number}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(call.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">{formatDuration(call.duration)}</div>
                        <div className="text-sm text-gray-600">${call.cost.toFixed(2)}</div>
                        <div 
                          className={`text-xs font-mono cursor-pointer transition-colors ${
                            highlightedImei === call.imei ? 'text-blue-600 font-semibold' : 'text-gray-400 hover:text-blue-600'
                          }`}
                          onClick={() => onImeiHighlight(highlightedImei === call.imei ? null : call.imei)}
                        >
                          {call.imei.slice(-6)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
