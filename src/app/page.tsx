"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SubscriberDashboard } from "@/components/subscriber-dashboard"

export default function HomePage() {
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

  useEffect(() => {
    // Redirect to landing page immediately
    window.location.replace("/landing")
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

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
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleBackToLanding = () => {
    window.location.href = "/landing"
  }

  if (subscriberData) {
    return (
      <SubscriberDashboard searchQuery={searchQuery} searchType={searchType} dateRange={subscriberData.dateRange} />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading FraudGuard 360°...</p>
      </div>
    </div>
  )
}
