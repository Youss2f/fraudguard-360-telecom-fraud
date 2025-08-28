"use client"

import { useState } from "react"
import { ArrowRight, Shield, Brain, MapPin, Network, TrendingUp, Users, Zap, CheckCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TourTrigger } from "@/components/demo-tour"

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Fraud Detection",
      description: "Real-time machine learning algorithms detect fraud patterns before they cause damage",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Geospatial Intelligence",
      description: "Interactive maps reveal fraud hotspots and impossible travel scenarios",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Network className="h-8 w-8" />,
      title: "Social Graph Analysis",
      description: "Uncover fraud rings through advanced relationship mapping and network analysis",
      color: "from-purple-500 to-violet-500",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Predictive Analytics",
      description: "Forecast fraud trends and prevent attacks before they happen",
      color: "from-orange-500 to-red-500",
    },
  ]

  const stats = [
    { value: "85%", label: "Fraud Reduction", icon: <Shield className="h-5 w-5" /> },
    { value: "60%", label: "Faster Detection", icon: <Zap className="h-5 w-5" /> },
    { value: "500%", label: "ROI Increase", icon: <TrendingUp className="h-5 w-5" /> },
    { value: "24/7", label: "Real-time Monitoring", icon: <Users className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FraudGuard 360°</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">
                Features
              </a>
              <a href="#analytics" className="text-white/80 hover:text-white transition-colors">
                Analytics
              </a>
              <a href="#security" className="text-white/80 hover:text-white transition-colors">
                Security
              </a>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-500/20 text-blue-200 border-blue-500/30 hover:bg-blue-500/30">
              <Star className="h-3 w-3 mr-1" />
              Next-Generation Fraud Analytics
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Stop Telecom Fraud
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Before It Starts
              </span>
            </h1>

            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Advanced AI-powered platform that detects, analyzes, and prevents telecom fraud in real-time. Protect your
              network with 360° subscriber intelligence and predictive analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-200"
                onClick={() => (window.location.href = "/search")}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Start Investigation
                <ArrowRight
                  className={`ml-2 h-5 w-5 transition-transform duration-200 ${isHovered ? "translate-x-1" : ""}`}
                />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3 text-blue-400">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Advanced Fraud Detection Capabilities</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Leverage cutting-edge technology to stay ahead of evolving fraud schemes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 group"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Fraud Detection?</h2>
          <p className="text-xl text-white/80 mb-8">
            Join leading telecom operators who trust FraudGuard 360° to protect their networks
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold"
              onClick={() => (window.location.href = "/search")}
            >
              Start Free Investigation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-white/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>No Setup Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Real-time Results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Enterprise Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">FraudGuard 360°</span>
            </div>
            <div className="text-white/60">© 2024 FraudGuard 360°. Advanced Telecom Security Platform.</div>
          </div>
        </div>
      </footer>

      {/* Demo Tour Trigger */}
      <TourTrigger />
    </div>
  )
}
