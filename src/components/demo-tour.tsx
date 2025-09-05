"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Play,
  ArrowRight,
  ArrowLeft,
  X,
  Lightbulb,
  Target,
  MousePointer,
  Eye,
  Download,
  Map,
  Shield,
} from "lucide-react"

interface TourStep {
  id: string
  title: string
  description: string
  target?: string
  icon: React.ReactNode
  action?: string
  highlight?: boolean
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to FraudGuard 360°",
    description:
      "This interactive demo showcases a comprehensive telecom fraud detection platform. Let's explore the key features that make this an impressive technical showcase.",
    icon: <Shield className="h-5 w-5" />,
    highlight: true,
  },
  {
    id: "search",
    title: "Subscriber Search",
    description:
      "Start by searching for a subscriber using MSISDN (+1234567890) or IMSI. The platform supports both telecom identifier types for comprehensive analysis.",
    target: "search-input",
    icon: <Target className="h-5 w-5" />,
    action: "Try entering: +1234567890",
  },
  {
    id: "ai-analysis",
    title: "AI-Powered Fraud Scoring",
    description:
      "Watch the real-time AI analysis in action. Multiple machine learning models analyze behavioral, network, device, and velocity patterns to generate risk scores.",
    target: "ai-card",
    icon: <Lightbulb className="h-5 w-5" />,
    action: "Observe the progress indicators and confidence scores",
  },
  {
    id: "imei-highlighting",
    title: "Cross-Reference IMEI Tracking",
    description:
      "Click any IMEI number to see it highlighted across all dashboard cards. This demonstrates device correlation and tracking capabilities.",
    target: "imei-highlight",
    icon: <MousePointer className="h-5 w-5" />,
    action: "Click any IMEI number to see the highlighting effect",
  },
  {
    id: "interactive-charts",
    title: "Advanced Data Visualization",
    description:
      "Explore interactive charts showing time-series data, call patterns, and fraud indicators. Hover over data points for detailed insights.",
    target: "charts",
    icon: <Eye className="h-5 w-5" />,
    action: "Hover over chart elements and expand card details",
  },
  {
    id: "filtering",
    title: "Smart Filtering System",
    description:
      "Use advanced filters to narrow down data by date ranges, locations, and event types. All visualizations update in real-time.",
    target: "filters",
    icon: <Target className="h-5 w-5" />,
    action: "Try different date ranges and filter combinations",
  },
  {
    id: "export",
    title: "Professional Export Features",
    description:
      "Generate professional PDF reports or CSV exports with custom section selection. Perfect for sharing analysis results.",
    target: "export-button",
    icon: <Download className="h-5 w-5" />,
    action: "Click Export to see the professional report options",
  },
  {
    id: "realtime",
    title: "Real-Time Monitoring",
    description:
      "Switch to the monitoring tab to see live fraud detection simulation with real-time alerts and pattern recognition.",
    target: "monitoring-tab",
    icon: <Map className="h-5 w-5" />,
    action: "Navigate to the Real-Time Monitoring tab",
  },
]

interface DemoTourProps {
  isOpen: boolean
  onClose: () => void
}

export function DemoTour({ isOpen, onClose }: DemoTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const currentTourStep = tourSteps[currentStep]

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const startTour = () => {
    setIsPlaying(true)
    setCurrentStep(0)
  }

  const skipTour = () => {
    onClose()
  }

  useEffect(() => {
    if (isOpen && currentTourStep.target) {
      const element = document.querySelector(`[data-tour="${currentTourStep.target}"]`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.classList.add("tour-highlight")

        return () => {
          element.classList.remove("tour-highlight")
        }
      }
    }
  }, [currentStep, isOpen, currentTourStep.target])

  if (!isOpen) return null

  return (
    <>
      {/* Tour Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />

      {/* Tour Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md z-[60]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {currentTourStep.icon}
                Interactive Demo Tour
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">
                {currentStep + 1} / {tourSteps.length}
              </span>
            </div>

            {/* Step Content */}
            <Card className={currentTourStep.highlight ? "border-blue-500 bg-blue-50/50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {currentTourStep.icon}
                  {currentTourStep.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600 leading-relaxed">{currentTourStep.description}</p>

                {currentTourStep.action && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {currentTourStep.action}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={skipTour}>
                  Skip Tour
                </Button>
                <Button onClick={nextStep} className="flex items-center gap-2">
                  {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tour Highlight Styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 55;
          box-shadow:
            0 0 0 4px rgba(59, 130, 246, 0.5),
            0 0 20px rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  )
}

// Tour Trigger Button Component
export function TourTrigger() {
  const [showTour, setShowTour] = useState(false)

  return (
    <>
      <Button
        onClick={() => setShowTour(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
        size="lg"
      >
        <Play className="h-4 w-4 mr-2" />
        Start Demo Tour
      </Button>

      <DemoTour isOpen={showTour} onClose={() => setShowTour(false)} />
    </>
  )
}
