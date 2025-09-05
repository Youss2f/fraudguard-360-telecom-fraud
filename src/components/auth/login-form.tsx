"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Shield, User, Lock, Eye, EyeOff, Info } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface DemoCredential {
  username: string
  password: string
  role: string
  description: string
}

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [demoCredentials, setDemoCredentials] = useState<DemoCredential[]>([])
  const { login, isLoading } = useAuth()

  useEffect(() => {
    // Fetch demo credentials
    fetch("/api/auth/login")
      .then((res) => res.json())
      .then((data) => setDemoCredentials(data.demo_credentials || []))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await login(username, password)
    if (!result.success) {
      setError(result.error || "Login failed")
    }
  }

  const handleDemoLogin = (credential: DemoCredential) => {
    setUsername(credential.username)
    setPassword(credential.password)
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FraudGuard 360°</h1>
          <p className="text-gray-300">Secure Access to Fraud Detection Platform</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/20 border-red-500/50">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        {demoCredentials.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Demo Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoCredentials.map((credential, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs text-blue-200 border-blue-200">
                          {credential.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">{credential.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin(credential)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Use
                    </Button>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {credential.username} / {credential.password}
                  </div>
                  {index < demoCredentials.length - 1 && <Separator className="bg-white/20" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>© 2024 FraudGuard 360° - Advanced Telecom Security Platform</p>
          <p className="mt-1">Demo Environment - For Showcase Purposes</p>
        </div>
      </div>
    </div>
  )
}
