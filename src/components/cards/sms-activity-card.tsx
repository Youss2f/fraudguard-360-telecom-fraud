"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Send, MessageCircle, Users, AlertTriangle, ChevronDown, ChevronUp, Clock, TrendingUp } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SmsActivity, FilterState } from "@/types/subscriber"

interface SmsActivityCardProps {
  data: SmsActivity
  filters: FilterState
  onImeiHighlight: (imei: string | null) => void
  highlightedImei: string | null
}

export function SmsActivityCard({ data, filters, onImeiHighlight, highlightedImei }: SmsActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            {data.bulkSmsDetection.detected && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Bulk SMS
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
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="logs">SMS Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Send className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {data.stats.sent}
                </div>
                <div className="text-sm text-gray-600">Sent</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <MessageCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {data.stats.received}
                </div>
                <div className="text-sm text-gray-600">Received</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  {data.stats.distinctContacts}
                </div>
                <div className="text-sm text-gray-600">Contacts</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">
                  {data.stats.avgPerDay}
                </div>
                <div className="text-sm text-gray-600">Avg/Day</div>
              </div>
            </div>

            {/* Bulk SMS Detection Alert */}
            {data.bulkSmsDetection.detected && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-semibold mb-2">Bulk SMS Activity Detected</div>
                  <div className="space-y-1">
                    <div>Suspicious messages: {data.bulkSmsDetection.suspiciousCount}</div>
                    <div>Patterns detected:</div>
                    <ul className="list-disc list-inside ml-4">
                      {data.bulkSmsDetection.patterns.map((pattern, index) => (
                        <li key={index} className="text-sm">{pattern}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Total Messages */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Total SMS Messages</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {data.stats.sent + data.stats.received}
                </Badge>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="patterns" className="space-y-4">
            {/* Peak Times */}
            <div className="space-y-2">
              <h4 className="font-semibold">SMS Activity by Hour</h4>
              <div className="h-48">
                <ChartContainer
                  config={{
                    count: { label: "SMS Count", color: "hsl(var(--chart-2))" }
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.peakTimes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Peak Hours Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.peakTimes
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((peak, index) => (
                  <div key={peak.hour} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-semibold text-green-600">
                        {index + 1}
                      </div>
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="font-semibold">
                      {peak.hour}:00 - {peak.hour + 1}:00
                    </div>
                    <div className="text-sm text-gray-600">
                      {peak.count} messages
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Recent SMS Logs</h4>
                <Badge variant="outline">{data.smsLogs.length} records</Badge>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {data.smsLogs.slice(0, 20).map((sms, index) => (
                  <div 
                    key={`${sms.timestamp}-${sms.number}`}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      highlightedImei === sms.imei 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {sms.type === "sent" ? (
                        <Send className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      )}
                      <div>
                        <div className="font-medium font-mono">{sms.number}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(sms.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">{sms.length} chars</div>
                      <div 
                        className={`text-xs font-mono cursor-pointer transition-colors ${
                          highlightedImei === sms.imei ? 'text-blue-600 font-semibold' : 'text-gray-400 hover:text-blue-600'
                        }`}
                        onClick={() => onImeiHighlight(highlightedImei === sms.imei ? null : sms.imei)}
                      >
                        {sms.imei.slice(-6)}
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
