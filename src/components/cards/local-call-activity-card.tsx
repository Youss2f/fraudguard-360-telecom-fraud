"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, Clock, Users, TrendingUp, ChevronDown, ChevronUp, PhoneCall, PhoneIncoming, Calendar } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LocalCallActivity, FilterState } from "@/types/subscriber"

interface LocalCallActivityCardProps {
  data: LocalCallActivity
  filters: FilterState
  onImeiHighlight: (imei: string | null) => void
  highlightedImei: string | null
}

export function LocalCallActivityCard({ data, filters, onImeiHighlight, highlightedImei }: LocalCallActivityCardProps) {
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

  const weekdayWeekendData = [
    { name: 'Weekday', calls: data.weekdayWeekendSplit.weekday.calls, duration: data.weekdayWeekendSplit.weekday.duration },
    { name: 'Weekend', calls: data.weekdayWeekendSplit.weekend.calls, duration: data.weekdayWeekendSplit.weekend.duration }
  ]

  const COLORS = ['#0088FE', '#00C49F']

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Local Call Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="logs">Call Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <PhoneCall className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {data.stats.totalCalls.outgoing}
                </div>
                <div className="text-sm text-gray-600">Outgoing</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <PhoneIncoming className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {data.stats.totalCalls.incoming}
                </div>
                <div className="text-sm text-gray-600">Incoming</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  {formatDuration(data.stats.avgDuration)}
                </div>
                <div className="text-sm text-gray-600">Avg Duration</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">
                  {data.stats.uniqueContacts}
                </div>
                <div className="text-sm text-gray-600">Unique Contacts</div>
              </div>
            </div>

            {/* Total Duration */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Total Call Duration</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {formatDuration(data.stats.totalDuration)}
                </Badge>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="patterns" className="space-y-4">
            {/* Time of Day Distribution */}
            <div className="space-y-2">
              <h4 className="font-semibold">Call Distribution by Hour</h4>
              <div className="h-48">
                <ChartContainer
                  config={{
                    callCount: { label: "Calls", color: "hsl(var(--chart-1))" }
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.timeOfDayDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="callCount" fill="var(--color-callCount)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Weekday vs Weekend */}
            <div className="space-y-2">
              <h4 className="font-semibold">Weekday vs Weekend Activity</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-48">
                  <ChartContainer
                    config={{
                      calls: { label: "Calls", color: "hsl(var(--chart-1))" }
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={weekdayWeekendData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="calls"
                        >
                          {weekdayWeekendData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <p className="text-center text-sm text-gray-600 mt-2">Call Count</p>
                </div>
                
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Weekday</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Calls: {data.weekdayWeekendSplit.weekday.calls}</div>
                      <div>Duration: {formatDuration(data.weekdayWeekendSplit.weekday.duration)}</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Weekend</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Calls: {data.weekdayWeekendSplit.weekend.calls}</div>
                      <div>Duration: {formatDuration(data.weekdayWeekendSplit.weekend.duration)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Recent Call Logs</h4>
                <Badge variant="outline">{data.callLogs.length} records</Badge>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {data.callLogs.slice(0, 20).map((call, index) => (
                  <div 
                    key={`${call.timestamp}-${call.number}`}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      highlightedImei === call.imei 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {call.type === "outgoing" ? (
                        <PhoneCall className="h-4 w-4 text-blue-600" />
                      ) : (
                        <PhoneIncoming className="h-4 w-4 text-green-600" />
                      )}
                      <div>
                        <div className="font-medium font-mono">{call.number}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(call.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">{formatDuration(call.duration)}</div>
                      <div className="text-xs text-gray-500">{call.cellSite}</div>
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
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
