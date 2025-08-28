import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberData } from '@/lib/database'
import { withSecurity, validateInput, ValidationSchemas } from '@/lib/security'
import { logRequest, logResponse, logBusinessEvent, createTimer } from '@/lib/logger'

async function getSubscriberHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const timer = createTimer()
  const requestData = logRequest(request, { operation: 'get_subscriber', subscriberId: params.id })

  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const searchType = searchParams.get('type') as 'msisdn' | 'imsi' || 'msisdn'
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    // Validate input parameters
    const validation = validateInput(ValidationSchemas.subscriberSearch, {
      id,
      type: searchType,
      startDate,
      endDate,
    })

    if (!validation.success) {
      const duration = timer.end()
      logResponse(requestData, 400, duration, { error: 'validation_failed' })

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
          details: validation.error
        },
        { status: 400 }
      )
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate date range if provided
    let dateRange
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      }
    }

    // Get subscriber data (with database fallback to mock)
    const subscriberData = await getSubscriberData(id, searchType)

    // Log business event
    logBusinessEvent('SUBSCRIBER_LOOKUP', 'subscriber', id, undefined, {
      searchType,
      dataSource: subscriberData.source || 'hybrid_system'
    })

    const duration = timer.end()

    // Add API metadata
    const response = {
      success: true,
      data: subscriberData,
      metadata: {
        searchQuery: id,
        searchType,
        dateRange,
        generatedAt: new Date().toISOString(),
        processingTime: `${duration}ms`,
        dataSource: subscriberData.source || 'hybrid_system',
        apiVersion: '1.0.0'
      }
    }

    logResponse(requestData, 200, duration, {
      subscriberId: id,
      dataSource: subscriberData.source
    })

    return NextResponse.json(response)

  } catch (error) {
    const duration = timer.end()

    logResponse(requestData, 500, duration, {
      error: 'subscriber_fetch_failed',
      subscriberId: id
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscriber data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Apply security middleware
export const GET = withSecurity(getSubscriberHandler)

// POST endpoint for updating subscriber data
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updateData = await request.json()

    // Simulate update processing
    await new Promise(resolve => setTimeout(resolve, 800))

    return NextResponse.json({
      success: true,
      message: `Subscriber ${id} updated successfully`,
      updatedFields: Object.keys(updateData),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update subscriber data'
      },
      { status: 500 }
    )
  }
}
