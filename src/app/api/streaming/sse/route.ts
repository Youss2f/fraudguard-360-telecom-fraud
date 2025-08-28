import { NextRequest } from 'next/server'
import { realTimeStream, StreamEventType, StreamEvent } from '@/lib/real-time-streaming'
import { logRequest, logBusinessEvent } from '@/lib/logger'

// SSE connection management
const connections = new Set<ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  const requestData = logRequest(request, { operation: 'sse_connection' })
  
  const { searchParams } = new URL(request.url)
  const eventTypes = searchParams.get('types')?.split(',') as StreamEventType[] || []
  const clientId = searchParams.get('client_id') || `client_${Date.now()}`

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      connections.add(controller)
      
      // Send initial connection message
      const initMessage = {
        type: 'connection',
        data: {
          client_id: clientId,
          timestamp: new Date().toISOString(),
          message: 'Connected to real-time stream',
          available_events: Object.values(StreamEventType),
          filtered_events: eventTypes.length > 0 ? eventTypes : 'all',
        },
      }
      
      controller.enqueue(`data: ${JSON.stringify(initMessage)}\n\n`)

      // Set up event listeners
      const handleStreamEvent = (event: StreamEvent) => {
        // Filter events if specific types requested
        if (eventTypes.length > 0 && !eventTypes.includes(event.type)) {
          return
        }

        try {
          const sseMessage = {
            type: event.type,
            data: {
              id: event.id,
              timestamp: event.timestamp,
              ...event.data,
              metadata: event.metadata,
            },
          }
          
          controller.enqueue(`data: ${JSON.stringify(sseMessage)}\n\n`)
        } catch (error) {
          console.error('Error sending SSE message:', error)
        }
      }

      const handleStreamError = (error: Error) => {
        const errorMessage = {
          type: 'error',
          data: {
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        }
        
        controller.enqueue(`data: ${JSON.stringify(errorMessage)}\n\n`)
      }

      const handleStreamStatus = (status: any) => {
        const statusMessage = {
          type: 'status',
          data: {
            ...status,
            timestamp: new Date().toISOString(),
          },
        }
        
        controller.enqueue(`data: ${JSON.stringify(statusMessage)}\n\n`)
      }

      // Subscribe to stream events
      realTimeStream.on('data', handleStreamEvent)
      realTimeStream.on('error', handleStreamError)
      realTimeStream.on('stream_started', handleStreamStatus)
      realTimeStream.on('stream_stopped', handleStreamStatus)

      // Send periodic heartbeat
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = {
            type: 'heartbeat',
            data: {
              timestamp: new Date().toISOString(),
              client_id: clientId,
              connections: connections.size,
            },
          }
          
          controller.enqueue(`data: ${JSON.stringify(heartbeat)}\n\n`)
        } catch (error) {
          console.error('Heartbeat error:', error)
          clearInterval(heartbeatInterval)
        }
      }, 30000) // Every 30 seconds

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        connections.delete(controller)
        clearInterval(heartbeatInterval)
        
        // Remove event listeners
        realTimeStream.off('data', handleStreamEvent)
        realTimeStream.off('error', handleStreamError)
        realTimeStream.off('stream_started', handleStreamStatus)
        realTimeStream.off('stream_stopped', handleStreamStatus)
        
        logBusinessEvent('SSE_DISCONNECTION', 'sse_client', clientId, undefined, {
          duration: Date.now() - parseInt(clientId.split('_')[1]),
          eventTypes: eventTypes.length > 0 ? eventTypes : 'all',
        })
        
        try {
          controller.close()
        } catch (error) {
          // Connection already closed
        }
      })

      // Log successful connection
      logBusinessEvent('SSE_CONNECTION', 'sse_client', clientId, undefined, {
        eventTypes: eventTypes.length > 0 ? eventTypes : 'all',
        userAgent: request.headers.get('user-agent'),
        ip: requestData.ip,
      })
    },
  })

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}
