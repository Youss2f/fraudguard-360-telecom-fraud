import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: any
}

interface UseApiOptions {
  requireAuth?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)
  const { isAuthenticated } = useAuth()

  const request = useCallback(async (
    url: string,
    config: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    // Check authentication if required
    if (options.requireAuth && !isAuthenticated) {
      const errorMsg = 'Authentication required'
      setError(errorMsg)
      options.onError?.(errorMsg)
      return { success: false, error: errorMsg }
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        ...config,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      setData(result.data || result)
      options.onSuccess?.(result.data || result)
      
      return {
        success: true,
        data: result.data || result,
        metadata: result.metadata
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Request failed'
      setError(errorMsg)
      options.onError?.(errorMsg)
      
      return {
        success: false,
        error: errorMsg
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, options])

  const get = useCallback((url: string) => {
    return request(url, { method: 'GET' })
  }, [request])

  const post = useCallback((url: string, data?: any) => {
    return request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }, [request])

  const put = useCallback((url: string, data?: any) => {
    return request(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }, [request])

  const del = useCallback((url: string) => {
    return request(url, { method: 'DELETE' })
  }, [request])

  return {
    isLoading,
    error,
    data,
    request,
    get,
    post,
    put,
    delete: del,
    clearError: () => setError(null),
    clearData: () => setData(null),
  }
}

// Specialized hooks for common API operations
export function useSubscriberApi() {
  const api = useApi({ requireAuth: true })

  const fetchSubscriber = useCallback(async (
    id: string, 
    type: 'msisdn' | 'imsi',
    dateRange?: { start: Date; end: Date }
  ) => {
    const params = new URLSearchParams({
      type,
      ...(dateRange && {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      }),
    })

    return api.get(`/api/subscribers/${id}?${params}`)
  }, [api])

  const updateSubscriber = useCallback(async (id: string, updateData: any) => {
    return api.post(`/api/subscribers/${id}`, updateData)
  }, [api])

  return {
    ...api,
    fetchSubscriber,
    updateSubscriber,
  }
}

export function useAnalyticsApi() {
  const api = useApi({ requireAuth: true })

  const fetchRealTimeData = useCallback(async () => {
    return api.get('/api/analytics/real-time')
  }, [api])

  return {
    ...api,
    fetchRealTimeData,
  }
}

export function useHealthApi() {
  const api = useApi()

  const checkHealth = useCallback(async () => {
    return api.get('/api/health')
  }, [api])

  return {
    ...api,
    checkHealth,
  }
}
