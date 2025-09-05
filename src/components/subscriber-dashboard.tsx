"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  MapPin,
  Activity,
  Brain,
  Shield,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Users,
  RefreshCw,
  Share,
  Bookmark,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { LocationFilter } from "@/components/location-filter"
import { EventTypeFilter } from "@/components/event-type-filter"
import { ExportDialog } from "@/components/export-dialog"
import { CaseManagement } from "@/components/case-management"
import { RealTimeMonitoring } from "@/components/real-time-monitoring"
import { InteractiveMap } from "@/components/interactive-map"
import { AdvancedAnalytics } from "@/components/advanced-analytics"
import { AIFraudScoreCard } from "@/components/cards/ai-fraud-score-card"
import { SubscriberOverviewCard } from "@/components/cards/subscriber-overview-card"
import { OverallActivityCard } from "@/components/cards/overall-activity-card"
import { LocalCallActivityCard } from "@/components/cards/local-call-activity-card"
import { SmsActivityCard } from "@/components/cards/sms-activity-card"
import { InternationalCallCard } from "@/components/cards/international-call-card"
import { DataUsageCard } from "@/components/cards/data-usage-card"
import { DealerAssociationCard } from "@/components/cards/dealer-association-card"
import { RechargePaymentCard } from "@/components/cards/recharge-payment-card"
import { generateMockDataWithAI } from "@/lib/mock-data-ai"
import { useToast } from "@/hooks/use-toast"
import type { SubscriberData, FilterState } from "@/types/subscriber"

interface SubscriberDashboardProps {
  searchQuery: string
  searchType: "msisdn" | "imsi"
  dateRange?: { start: Date; end: Date }
}

export function SubscriberDashboard({ searchQuery, searchType, dateRange }: SubscriberDashboardProps) {
  const [subscriberData, setSubscriberData] = useState<SubscriberData | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    dateRange: dateRange
      ? { from: dateRange.start, to: dateRange.end }
      : { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() },
    locations: [],
    eventTypes: [],
  })
  const [highlightedImei, setHighlightedImei] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [aiAnalysisProgress, setAiAnalysisProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [cardLayout, setCardLayout] = useState<"grid" | "list">("grid")
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setAiAnalysisProgress(0)

      // Simulate AI analysis progress
      const progressInterval = setInterval(() => {
        setAiAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)

      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockData = generateMockDataWithAI(searchQuery, searchType, dateRange)
      setSubscriberData(mockData)
      setIsLoading(false)

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed subscriber ${searchQuery} with AI-powered fraud detection`,
      })
    }

    fetchData()
  }, [searchQuery, searchType, dateRange, toast])

  const handleBack = () => {
    window.location.href = "/search"
  }

  const handleImeiHighlight = (imei: string | null) => {
    setHighlightedImei(imei)
    if (imei) {
      toast({
        title: "IMEI Highlighted",
        description: `Tracking activities for IMEI: ${imei.slice(-6)}`,
      })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (subscriberData) {
      const refreshedData = generateMockDataWithAI(searchQuery, searchType, dateRange)
      setSubscriberData(refreshedData)
    }

    setIsRefreshing(false)
    toast({
      title: "Data Refreshed",
      description: "Subscriber data has been updated with latest information",
    })
  }

  const handleBookmark = () => {
    toast({
      title: "Bookmark Saved",
      description: `Subscriber ${searchQuery} has been bookmarked for quick access`,
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link Copied",
      description: "Dashboard link has been copied to clipboard",
    })
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "Critical", color: "destructive", icon: AlertTriangle }
    if (score >= 60) return { level: "High", color: "destructive", icon: AlertTriangle }
    if (score >= 40) return { level: "Medium", color: "secondary", icon: TrendingUp }
    return { level: "Low", color: "default", icon: Shield }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[70vh]">
            <Card className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-8 w-8 text-white animate-pulse" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Analysis in Progress</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Analyzing subscriber data for {searchType.toUpperCase()}: {searchQuery}
                </p>

                <div className="space-y-4">
                  <Progress value={aiAnalysisProgress} className="h-2" />
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {aiAnalysisProgress < 30 && "Collecting subscriber data..."}
                    {aiAnalysisProgress >= 30 && aiAnalysisProgress < 60 && "Running fraud detection algorithms..."}
                    {aiAnalysisProgress >= 60 && aiAnalysisProgress < 90 && "Analyzing behavioral patterns..."}
                    {aiAnalysisProgress >= 90 && "Generating intelligence report..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!subscriberData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">No subscriber data found</p>
            <Button onClick={handleBack} className="bg-gradient-to-r from-blue-500 to-cyan-500">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const riskInfo = getRiskLevel(subscriberData.aiAnalysis.overallRiskScore)
  const RiskIcon = riskInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Enhanced Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Subscriber Profile: {searchQuery}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchType.toUpperCase()} Analysis • {filters.dateRange.from?.toLocaleDateString()} -{" "}
                    {filters.dateRange.to?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* AI Risk Score Display */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border dark:border-gray-700">
                <Brain className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Risk Score:</span>
                <Badge
                  variant={riskInfo.color as "default" | "secondary" | "destructive" | "outline"}
                  className="flex items-center gap-1"
                >
                  <RiskIcon className="h-3 w-3" />
                  {subscriberData.aiAnalysis.overallRiskScore}% {riskInfo.level}
                </Badge>
              </div>

              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              <Button variant="outline" size="sm" onClick={handleBookmark}>
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmark
              </Button>

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Alert */}
      {subscriberData.aiAnalysis.overallRiskScore >= 60 && (
        <div className="bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Alert className="border-red-200 dark:border-red-800 bg-transparent">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <span className="font-semibold">High Risk Subscriber Detected:</span> AI analysis indicates potential
                fraud activity. Immediate investigation recommended. Risk factors:{" "}
                {subscriberData.aiAnalysis.riskFactors.slice(0, 3).join(", ")}.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between py-4">
              <TabsList className="bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Advanced Analytics
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Live Monitoring
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Geospatial
                </TabsTrigger>
                <TabsTrigger value="cases" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Case Management
                </TabsTrigger>
              </TabsList>

              {activeTab === "dashboard" && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <DatePickerWithRange
                      date={filters.dateRange}
                      onDateChange={(dateRange) => {
                        if (dateRange && dateRange.from && dateRange.to) {
                          setFilters((prev) => ({ 
                            ...prev, 
                            dateRange: { 
                              from: dateRange.from as Date, 
                              to: dateRange.to as Date 
                            }
                          }))
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <LocationFilter
                      selectedLocations={filters.locations}
                      onLocationChange={(locations) => setFilters((prev) => ({ ...prev, locations }))}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gray-500" />
                    <EventTypeFilter
                      selectedEventTypes={filters.eventTypes}
                      onEventTypeChange={(eventTypes) => setFilters((prev) => ({ ...prev, eventTypes }))}
                    />
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center gap-2">
                    <Button
                      variant={cardLayout === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCardLayout("grid")}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={cardLayout === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCardLayout("list")}
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Content */}
            <TabsContent value="dashboard" className="mt-0">
              <div className="max-w-7xl mx-auto p-6">
                <div
                  className={`grid gap-6 ${cardLayout === "grid" ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}
                >
                  {/* AI Fraud Score Card - Full Width */}
                  <div className={cardLayout === "grid" ? "xl:col-span-3" : ""}>
                    <AIFraudScoreCard
                      data={subscriberData.aiAnalysis}
                      subscriberInfo={{ msisdn: searchQuery, searchType }}
                    />
                  </div>

                  {/* Subscriber Overview - Full Width */}
                  <div className={cardLayout === "grid" ? "xl:col-span-3" : ""}>
                    <SubscriberOverviewCard
                      data={subscriberData.overview}
                      onImeiHighlight={handleImeiHighlight}
                      highlightedImei={highlightedImei}
                    />
                  </div>

                  {/* Overall Activity - 2 Columns */}
                  <div className={cardLayout === "grid" ? "xl:col-span-2" : ""}>
                    <OverallActivityCard
                      data={subscriberData.overallActivity}
                      filters={filters}
                      onImeiHighlight={handleImeiHighlight}
                      highlightedImei={highlightedImei}
                    />
                  </div>

                  {/* Individual Cards */}
                  <LocalCallActivityCard
                    data={subscriberData.localCallActivity}
                    filters={filters}
                    onImeiHighlight={handleImeiHighlight}
                    highlightedImei={highlightedImei}
                  />

                  <SmsActivityCard
                    data={subscriberData.smsActivity}
                    filters={filters}
                    onImeiHighlight={handleImeiHighlight}
                    highlightedImei={highlightedImei}
                  />

                  <InternationalCallCard
                    data={subscriberData.internationalCallActivity}
                    filters={filters}
                    onImeiHighlight={handleImeiHighlight}
                    highlightedImei={highlightedImei}
                  />

                  <DataUsageCard
                    data={subscriberData.dataUsage}
                    filters={filters}
                    onImeiHighlight={handleImeiHighlight}
                    highlightedImei={highlightedImei}
                  />

                  <DealerAssociationCard data={subscriberData.dealerAssociation} filters={filters} />

                  <RechargePaymentCard data={subscriberData.rechargePayment} filters={filters} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="max-w-7xl mx-auto p-6">
                <AdvancedAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="mt-0">
              <div className="max-w-7xl mx-auto p-6">
                <RealTimeMonitoring />
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <div className="max-w-7xl mx-auto p-6">
                <InteractiveMap />
              </div>
            </TabsContent>

            <TabsContent value="cases" className="mt-0">
              <div className="max-w-7xl mx-auto p-6">
                <CaseManagement />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        subscriberData={subscriberData}
        searchQuery={searchQuery}
      />
    </div>
  )
}
