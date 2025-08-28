"use client"

import { useState } from "react"
import { MapPin, Users, AlertTriangle, TrendingUp, Filter, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface LocationData {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  type: "cell_tower" | "fraud_hotspot" | "dealer" | "subscriber_cluster"
  riskLevel: "low" | "medium" | "high" | "critical"
  metrics: {
    subscribers: number
    fraudCases: number
    riskScore: number
    activity: number
  }
  details: {
    address: string
    region: string
    lastUpdate: string
  }
}

export function InteractiveMap() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [mapView, setMapView] = useState<"satellite" | "street" | "terrain">("street")
  const [showLayers, setShowLayers] = useState({
    cellTowers: true,
    fraudHotspots: true,
    dealers: true,
    subscriberClusters: true,
  })
  const [riskFilter, setRiskFilter] = useState("all")

  // Mock location data
  const locations: LocationData[] = [
    {
      id: "LOC-001",
      name: "Manhattan Central",
      coordinates: { lat: 40.7589, lng: -73.9851 },
      type: "fraud_hotspot",
      riskLevel: "critical",
      metrics: {
        subscribers: 15420,
        fraudCases: 89,
        riskScore: 92,
        activity: 2847,
      },
      details: {
        address: "Times Square Area, Manhattan, NY",
        region: "NYC-Central",
        lastUpdate: "2024-01-15T14:30:00Z",
      },
    },
    {
      id: "LOC-002",
      name: "Brooklyn Heights",
      coordinates: { lat: 40.6962, lng: -73.9961 },
      type: "cell_tower",
      riskLevel: "medium",
      metrics: {
        subscribers: 8934,
        fraudCases: 23,
        riskScore: 45,
        activity: 1256,
      },
      details: {
        address: "Brooklyn Heights, Brooklyn, NY",
        region: "NYC-Brooklyn",
        lastUpdate: "2024-01-15T14:25:00Z",
      },
    },
    {
      id: "LOC-003",
      name: "Queens Plaza",
      coordinates: { lat: 40.7505, lng: -73.937 },
      type: "dealer",
      riskLevel: "high",
      metrics: {
        subscribers: 3421,
        fraudCases: 67,
        riskScore: 78,
        activity: 892,
      },
      details: {
        address: "Queens Plaza, Long Island City, NY",
        region: "NYC-Queens",
        lastUpdate: "2024-01-15T14:20:00Z",
      },
    },
    {
      id: "LOC-004",
      name: "Bronx Concourse",
      coordinates: { lat: 40.8448, lng: -73.9254 },
      type: "subscriber_cluster",
      riskLevel: "low",
      metrics: {
        subscribers: 12567,
        fraudCases: 12,
        riskScore: 28,
        activity: 1834,
      },
      details: {
        address: "Grand Concourse, Bronx, NY",
        region: "NYC-Bronx",
        lastUpdate: "2024-01-15T14:15:00Z",
      },
    },
  ]

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "#ef4444"
      case "high":
        return "#f97316"
      case "medium":
        return "#eab308"
      case "low":
        return "#22c55e"
      default:
        return "#6b7280"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cell_tower":
        return "📡"
      case "fraud_hotspot":
        return "🚨"
      case "dealer":
        return "🏪"
      case "subscriber_cluster":
        return "👥"
      default:
        return "📍"
    }
  }

  const filteredLocations = locations.filter((location) => {
    if (riskFilter !== "all" && location.riskLevel !== riskFilter) return false
    if (!showLayers.cellTowers && location.type === "cell_tower") return false
    if (!showLayers.fraudHotspots && location.type === "fraud_hotspot") return false
    if (!showLayers.dealers && location.type === "dealer") return false
    if (!showLayers.subscriberClusters && location.type === "subscriber_cluster") return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Geospatial Intelligence</h2>
          <p className="text-gray-600 dark:text-gray-400">Interactive fraud detection mapping and location analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={mapView} onValueChange={(value: any) => setMapView(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="street">Street</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Map Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Level Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Risk Level Filter</Label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Layer Controls */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Map Layers</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cellTowers"
                    checked={showLayers.cellTowers}
                    onCheckedChange={(checked) => setShowLayers((prev) => ({ ...prev, cellTowers: !!checked }))}
                  />
                  <Label htmlFor="cellTowers" className="text-sm">
                    📡 Cell Towers
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fraudHotspots"
                    checked={showLayers.fraudHotspots}
                    onCheckedChange={(checked) => setShowLayers((prev) => ({ ...prev, fraudHotspots: !!checked }))}
                  />
                  <Label htmlFor="fraudHotspots" className="text-sm">
                    🚨 Fraud Hotspots
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dealers"
                    checked={showLayers.dealers}
                    onCheckedChange={(checked) => setShowLayers((prev) => ({ ...prev, dealers: !!checked }))}
                  />
                  <Label htmlFor="dealers" className="text-sm">
                    🏪 Dealers
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subscriberClusters"
                    checked={showLayers.subscriberClusters}
                    onCheckedChange={(checked) => setShowLayers((prev) => ({ ...prev, subscriberClusters: !!checked }))}
                  />
                  <Label htmlFor="subscriberClusters" className="text-sm">
                    👥 Subscriber Clusters
                  </Label>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Risk Level Legend</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Critical (80-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-xs">High (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs">Medium (40-59%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Low (0-39%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Interactive Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simulated Map Display */}
            <div className="relative h-96 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg overflow-hidden">
              {/* Map Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Location Markers */}
              {filteredLocations.map((location, index) => (
                <div
                  key={location.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${30 + index * 10}%`,
                  }}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                    style={{ backgroundColor: getRiskColor(location.riskLevel) }}
                  >
                    <span className="text-xs">{getTypeIcon(location.type)}</span>
                  </div>

                  {/* Risk Level Indicator */}
                  <div className="absolute -top-1 -right-1">
                    <div
                      className="w-3 h-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: getRiskColor(location.riskLevel) }}
                    ></div>
                  </div>

                  {/* Location Label */}
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap">
                    {location.name}
                  </div>
                </div>
              ))}

              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-transparent">
                  +
                </Button>
                <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-transparent">
                  -
                </Button>
              </div>

              {/* Current View Info */}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded shadow-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Showing {filteredLocations.length} locations • {mapView} view
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLocation ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedLocation.details.address}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={selectedLocation.riskLevel === "critical" ? "destructive" : "secondary"}>
                      {selectedLocation.riskLevel} risk
                    </Badge>
                    <Badge variant="outline">{selectedLocation.type.replace("_", " ")}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subscribers</span>
                    <span className="font-medium">{selectedLocation.metrics.subscribers.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fraud Cases</span>
                    <span className="font-medium text-red-600">{selectedLocation.metrics.fraudCases}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Risk Score</span>
                    <span className="font-medium">{selectedLocation.metrics.riskScore}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Activity Level</span>
                    <span className="font-medium">{selectedLocation.metrics.activity}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(selectedLocation.details.lastUpdate).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Region: {selectedLocation.details.region}</div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    Create Alert
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Click on a location marker to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{locations.filter((l) => l.riskLevel === "critical").length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Critical Risk Areas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {locations.reduce((sum, l) => sum + l.metrics.subscribers, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Subscribers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{locations.reduce((sum, l) => sum + l.metrics.fraudCases, 0)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fraud Cases</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{locations.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monitored Locations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
