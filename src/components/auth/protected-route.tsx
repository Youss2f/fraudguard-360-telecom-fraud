"use client"

import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'
import { LoginForm } from './login-form'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
  requiredPermission?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Authenticating...</span>
            </div>
            <p className="text-gray-300 text-sm text-center">
              Verifying your credentials and loading the fraud detection platform
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300 mb-4">
              You don't have the required role ({requiredRole}) to access this resource.
            </p>
            <p className="text-sm text-gray-400">
              Current role: {user?.role}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check permission-based access
  if (requiredPermission && user?.permissions && !user.permissions.includes(requiredPermission)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Insufficient Permissions</h2>
            <p className="text-gray-300 mb-4">
              You don't have the required permission ({requiredPermission}) to access this resource.
            </p>
            <p className="text-sm text-gray-400">
              Available permissions: {user?.permissions?.join(', ') || 'None'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is authenticated and authorized
  return <>{children}</>
}
