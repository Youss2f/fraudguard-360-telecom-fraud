"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Store, MapPin, Calendar, Users, AlertTriangle, ChevronDown, ChevronUp, Phone, TrendingUp } from 'lucide-react'
import { DealerAssociation, FilterState } from "@/types/subscriber"

interface DealerAssociationCardProps {
  data: DealerAssociation
  filters: FilterState
}

export function DealerAssociationCard({ data, filters }: DealerAssociationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Suspended":
        return "secondary"
      case "Terminated":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getRiskFlagColor = (flag: string) => {
    if (flag.includes("Suspicious") || flag.includes("Bulk")) {
      return "destructive"
    }
    return "secondary"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Dealer Association
          </CardTitle>
          <div className="flex items-center gap-2">
            {data.dealerStats.suspiciousActivations > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {data.dealerStats.suspiciousActivations} Suspicious
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activations">Recent Activations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Dealer Information */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-semibold text-lg">{data.dealerInfo.dealerName}</div>
                    <div className="text-sm text-gray-600">ID: {data.dealerInfo.dealerId}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{data.dealerInfo.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Activation: {new Date(data.dealerInfo.activationDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Activation Location */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">Activation Location</span>
              </div>
              <div className="text-sm text-gray-700">
                <div>Cell Site: {data.dealerInfo.activationLocation.cellSite}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Coordinates: {data.dealerInfo.activationLocation.coordinates.lat.toFixed(4)}, {data.dealerInfo.activationLocation.coordinates.lng.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Dealer Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {data.dealerStats.totalSubscribersActivated}
                </div>
                <div className="text-sm text-gray-600">Total Activations</div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {data.dealerStats.activationsLast30Days}
                </div>
                <div className="text-sm text-gray-600">Last 30 Days</div>
              </div>
              
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-red-600">
                  {data.dealerStats.suspiciousActivations}
                </div>
                <div className="text-sm text-gray-600">Suspicious</div>
              </div>
            </div>

            {/* Suspicious Activity Alert */}
            {data.dealerStats.suspiciousActivations > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-semibold mb-2">Suspicious Activation Activity Detected</div>
                  <div className="text-sm">
                    This dealer has {data.dealerStats.suspiciousActivations} suspicious activations. Manual review recommended.
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="activations" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Recent Activations by This Dealer</h4>
                <Badge variant="outline">{data.recentActivations.length} records</Badge>
              </div>
              
              <div className="space-y-2">
                {data.recentActivations.map((activation) => (
                  <div 
                    key={activation.msisdn}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="font-medium font-mono">{activation.msisdn}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(activation.activationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(activation.status)}>
                        {activation.status}
                      </Badge>
                      {activation.riskFlags.length > 0 && (
                        <div className="flex gap-1">
                          {activation.riskFlags.map((flag, index) => (
                            <Badge
                              key={index}
                              variant={getRiskFlagColor(flag)}
                              className="text-xs"
                            >
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      )}
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
