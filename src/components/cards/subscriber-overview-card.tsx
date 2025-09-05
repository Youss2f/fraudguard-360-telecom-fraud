"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Phone,
  Smartphone,
  MapPin,
  Calendar,
  Activity,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { SubscriberOverview } from "@/types/subscriber"

interface SubscriberOverviewCardProps {
  data: SubscriberOverview
  onImeiHighlight: (imei: string | null) => void
  highlightedImei: string | null
}

export function SubscriberOverviewCard({ data, onImeiHighlight, highlightedImei }: SubscriberOverviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Suspended":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "Terminated":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Subscriber Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(data.status)} className="flex items-center gap-1">
              {getStatusIcon(data.status)}
              {data.status}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primary Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone className="h-4 w-4" />
              MSISDN
            </div>
            <div className="font-mono text-lg font-semibold">{data.msisdn}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Smartphone className="h-4 w-4" />
              IMSI
            </div>
            <div className="font-mono text-lg font-semibold">{data.imsi}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Smartphone className="h-4 w-4" />
              Current IMEI
            </div>
            <div
              className={`font-mono text-lg font-semibold cursor-pointer transition-colors ${
                highlightedImei === data.currentImei
                  ? "text-blue-600 bg-blue-50 px-2 py-1 rounded"
                  : "hover:text-blue-600"
              }`}
              onClick={() => onImeiHighlight(highlightedImei === data.currentImei ? null : data.currentImei)}
            >
              {data.currentImei}
            </div>
          </div>
        </div>

        <Separator />

        {/* Location & Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              Current Location
            </div>
            <div>
              <div className="font-semibold">{data.currentLocation.address}</div>
              <div className="text-sm text-gray-500">
                Cell Site: {data.currentLocation.cellSite} | LAC: {data.currentLocation.lac}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Activity className="h-4 w-4" />
              Last Activity
            </div>
            <div className="font-semibold">{new Date(data.lastActivity).toLocaleString()}</div>
          </div>
        </div>

        {/* Device Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Smartphone className="h-4 w-4" />
            Device Information
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold">
              {data.deviceInfo.manufacturer} {data.deviceInfo.model}
            </div>
            <div className="text-sm text-gray-600">{data.deviceInfo.os}</div>
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator />

            {/* Expanded Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    Activation Date
                  </div>
                  <div className="font-semibold">{new Date(data.activationDate).toLocaleDateString()}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Subscription Type</div>
                  <Badge variant="outline">{data.subscriptionType}</Badge>
                </div>
              </div>

              {/* IMEI History */}
              <div className="space-y-2">
                <div className="text-sm text-gray-500">IMEI History</div>
                <div className="flex flex-wrap gap-2">
                  {data.deviceInfo.imeiHistory.map((imei, index) => (
                    <Badge
                      key={imei}
                      variant={imei === data.currentImei ? "default" : "secondary"}
                      className={`font-mono cursor-pointer transition-colors ${
                        highlightedImei === imei ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => onImeiHighlight(highlightedImei === imei ? null : imei)}
                    >
                      {imei} {index === 0 && "(Current)"}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Dealer Information */}
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Dealer Information</div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-semibold">{data.dealerInfo.dealerName}</div>
                  <div className="text-sm text-gray-600">ID: {data.dealerInfo.dealerId}</div>
                  <div className="text-sm text-gray-600">{data.dealerInfo.location}</div>
                </div>
              </div>

              {/* Network Information */}
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Network Information</div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Home: {data.networkInfo.homeNetwork}</div>
                      <div className="text-sm text-gray-600">Current: {data.networkInfo.currentNetwork}</div>
                    </div>
                    <Badge variant={data.networkInfo.roamingStatus ? "secondary" : "default"}>
                      {data.networkInfo.roamingStatus ? "Roaming" : "Home Network"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
