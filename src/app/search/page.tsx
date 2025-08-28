"use client"

import type React from "react"

import { useState } from "react"
import { Search, Phone, Smartphone, Calendar, ArrowLeft, Sparkles, Shield, Brain, Settings, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { AdvancedSearch } from "@/components/advanced-search"
import { SubscriberDashboard } from "@/components/subscriber-dashboard"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { demoScenarios, type DemoScenario } from "@/lib/demo-scenarios"

interface SearchCriteria {
  id: string
  field: string
  operator: string
  value: string
  type: "text" | "number" | "date" | "boolean"
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"msisdn" | "imsi">("msisdn")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [subscriberData, setSubscriberData] = useState<{
    searchQuery: string
    searchType: "msisdn" | "imsi"
    dateRange: { start: Date; end: Date }
    timestamp: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [recentSearches] = useState([
    { query: "+1234567890", type: "msisdn", timestamp: "2024-01-15T10:30:00Z" },
    { query: "310150123456789", type: "imsi", timestamp: "2024-01-14T15:45:00Z" },
    { query: "+1987654321", type: "msisdn", timestamp: "2024-01-14T09:20:00Z" },
  ])
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a search query",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate API call with date range (7 days before selected date)
    setTimeout(() => {
      const endDate = new Date(selectedDate)
      const startDate = new Date(selectedDate)
      startDate.setDate(startDate.getDate() - 7)

      setSubscriberData({
        searchQuery,
        searchType,
        dateRange: { start: startDate, end: endDate },
        timestamp: new Date().toISOString(),
      })
      setIsLoading(false)

      toast({
        title: "Search Completed",
        description: `Found subscriber data for ${searchQuery}`,
      })
    }, 1500)
  }

  const handleAdvancedSearch = (criteria: SearchCriteria[]) => {
    setShowAdvancedSearch(false)
    setIsLoading(true)

    // Simulate advanced search
    setTimeout(() => {
      const endDate = new Date(selectedDate)
      const startDate = new Date(selectedDate)
      startDate.setDate(startDate.getDate() - 7)

      setSubscriberData({
        searchQuery: "Advanced Search Results",
        searchType: "msisdn",
        dateRange: { start: startDate, end: endDate },
        timestamp: new Date().toISOString(),
      })
      setIsLoading(false)

      toast({
        title: "Advanced Search Completed",
        description: `Found results matching ${criteria.length} criteria`,
      })
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleBackToLanding = () => {
    window.location.href = "/landing"
  }

  const loadRecentSearch = (search: any) => {
    setSearchQuery(search.query)
    setSearchType(search.type)
    toast({
      title: "Search Loaded",
      description: `Loaded recent search: ${search.query}`,
    })
  }

  if (subscriberData) {
    return (
      <SubscriberDashboard searchQuery={searchQuery} searchType={searchType} dateRange={subscriberData.dateRange} />
    )
  }

  if (showAdvancedSearch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <AdvancedSearch onSearch={handleAdvancedSearch} onClose={() => setShowAdvancedSearch(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  FraudGuard 360°
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Advanced Fraud Analytics Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <ThemeToggle />
              <Button variant="ghost" onClick={handleBackToLanding} className="text-gray-600 dark:text-gray-400">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Real-time Fraud Detection & Analysis
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Subscriber 360° Profile
            <span className="block text-3xl md:text-4xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Intelligence Dashboard
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Advanced AI-powered analytics for comprehensive subscriber investigation and fraud detection. Get insights
            from the past 7 days of activity.
          </p>
        </div>

        {/* Enhanced Search Card */}
        <Card className="max-w-3xl mx-auto shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Search className="h-5 w-5 text-white" />
                </div>
                Search Subscriber Profile
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowAdvancedSearch(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Enter subscriber details and select analysis period to generate comprehensive fraud intelligence report
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Searches</label>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => loadRecentSearch(search)}
                      className="text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {search.query} ({search.type.toUpperCase()})
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Scenarios */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Demo Scenarios - Try These Examples
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {demoScenarios.map((scenario) => (
                  <Card
                    key={scenario.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500"
                    onClick={() => {
                      setSearchQuery(scenario.searchQuery)
                      setSearchType(scenario.searchType)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{scenario.name}</h4>
                        <Badge
                          variant={
                            scenario.riskLevel === "Critical" ? "destructive" :
                            scenario.riskLevel === "High" ? "destructive" :
                            scenario.riskLevel === "Medium" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {scenario.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {scenario.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {scenario.searchType.toUpperCase()}: {scenario.searchQuery}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Search Type Tabs */}
            <Tabs value={searchType} onValueChange={(value) => setSearchType(value as "msisdn" | "imsi")}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger
                  value="msisdn"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
                >
                  <Phone className="h-4 w-4" />
                  Phone Number (MSISDN)
                </TabsTrigger>
                <TabsTrigger
                  value="imsi"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
                >
                  <Smartphone className="h-4 w-4" />
                  IMSI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="msisdn" className="space-y-6 mt-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Phone Number (MSISDN)
                  </label>
                  <Input
                    placeholder="e.g., +1234567890 or 1234567890"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-lg h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the subscriber's mobile phone number for comprehensive analysis
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="imsi" className="space-y-6 mt-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    International Mobile Subscriber Identity (IMSI)
                  </label>
                  <Input
                    placeholder="e.g., 310150123456789"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-lg h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the 15-digit IMSI for detailed subscriber investigation
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Date Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Analysis End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="mr-3 h-5 w-5 text-blue-500" />
                    {selectedDate ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Analysis period:{" "}
                          {new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} -{" "}
                          {selectedDate.toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span>Select analysis end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select the end date for analysis. The system will analyze 7 days of data ending on this date.
              </p>
            </div>

            {/* Enhanced Search Button */}
            <Button
              onClick={handleSearch}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              disabled={!searchQuery.trim() || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing Subscriber Data...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5" />
                  Generate Intelligence Report
                </div>
              )}
            </Button>

            {/* Sample Data Info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Demo Data Available</h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                    Use these sample credentials to explore the platform's capabilities:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">SAMPLE MSISDN</div>
                      <div className="font-mono text-sm text-blue-900 dark:text-blue-100">+1234567890</div>
                    </div>
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">SAMPLE IMSI</div>
                      <div className="font-mono text-sm text-blue-900 dark:text-blue-100">310150123456789</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Advanced machine learning algorithms detect fraud patterns and anomalies
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">360° Investigation</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Comprehensive subscriber profiling with cross-device activity tracking
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Security</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Instant fraud detection with automated risk scoring and alerts
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
