"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  ChevronDown,
  Clock,
  MapPin
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function UserProfile() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
  }

  if (!user) return null

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'fraud_analyst':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'demo_user':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getInitials = (username: string) => {
    return username.split('.').map(part => part[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{user.username}</span>
            <span className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="p-0">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base">{user.username}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRoleColor(user.role)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-3">
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  {user.email}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Session active since {new Date().toLocaleTimeString()}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                Demo Environment
              </div>

              {user.permissions && user.permissions.length > 0 && (
                <div>
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Permissions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Account Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 text-red-600 focus:text-red-600"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
