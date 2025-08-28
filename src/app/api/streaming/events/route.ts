import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/security'
import { 
  getLatestStreamEvents, 
  getStreamStatus, 
  startRealTimeStream, 
  stopRealTimeStream,
  realTimeStream,
  StreamEventType 
} from '@/lib/real-time-streaming'
import { logRequest, logResponse, createTimer } from '@/lib/logger'

async function streamingHandler(request: NextRequest) {
  const timer = createTimer()
  const requestData = logRequest(request, { operation: 'streaming_events' })

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'
    const eventType = searchParams.get('type') as StreamEventType
    const limit = parseInt(searchParams.get('limit') || '50')

    let response: any = {
      timestamp: new Date().toISOString(),
      action,
    }

    switch (action) {
      case 'status':
        // Get streaming status
        response = {
          ...response,
          streaming_status: getStreamStatus(),
          available_event_types: Object.values(StreamEventType),
          endpoints: {
            start_stream: '/api/streaming/events?action=start',
            stop_stream: '/api/streaming/events?action=stop',
            latest_events: '/api/streaming/events?action=latest',
            subscribe_sse: '/api/streaming/sse',
          },
        }
        break

      case 'start':
        // Start real-time streaming
        startRealTimeStream()
        response = {
          ...response,
          message: 'Real-time streaming started',
          status: getStreamStatus(),
        }
        break

      case 'stop':
        // Stop real-time streaming
        stopRealTimeStream()
        response = {
          ...response,
          message: 'Real-time streaming stopped',
          status: getStreamStatus(),
        }
        break

      case 'latest':
        // Get latest events
        const events = await getLatestStreamEvents()
        const filteredEvents = eventType 
          ? events.filter(event => event.type === eventType)
          : events
        
        response = {
          ...response,
          events: filteredEvents.slice(0, limit),
          total_events: filteredEvents.length,
          event_type_filter: eventType || 'all',
          limit,
        }
        break

      default:
        const duration = timer.end()
        logResponse(requestData, 400, duration, { error: 'invalid_action' })
        
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            valid_actions: ['status', 'start', 'stop', 'latest'],
          },
          { status: 400 }
        )
    }

    const duration = timer.end()
    logResponse(requestData, 200, duration, { action, eventCount: response.events?.length })

    return NextResponse.json({
      success: true,
      data: response,
    })

  } catch (error) {
    const duration = timer.end()
    logResponse(requestData, 500, duration, { error: 'streaming_operation_failed' })

    return NextResponse.json(
      {
        success: false,
        error: 'Streaming operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Apply security middleware
export const GET = withSecurity(streamingHandler)
export const POST = withSecurity(streamingHandler)
