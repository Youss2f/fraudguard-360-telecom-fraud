import { NextRequest, NextResponse } from "next/server"
import { withSecurity } from "@/lib/security"
import { processAllCDRFiles, generateSampleCDRFile, CDRFormat } from "@/lib/cdr-processor"
import { logRequest, logResponse, logBusinessEvent, createTimer } from "@/lib/logger"

async function processCDRHandler(request: NextRequest) {
  const timer = createTimer()
  const requestData = logRequest(request, { operation: "process_cdr_files" })

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || "process"
    const format = (searchParams.get("format") as CDRFormat) || CDRFormat.CSV
    const recordCount = parseInt(searchParams.get("records") || "100")

    let response: any = {
      timestamp: new Date().toISOString(),
      action,
    }

    if (action === "generate_sample") {
      // Generate sample CDR file for testing
      const filePath = generateSampleCDRFile(format, recordCount)

      response = {
        ...response,
        message: "Sample CDR file generated successfully",
        file_path: filePath,
        format,
        record_count: recordCount,
      }

      logBusinessEvent("CDR_SAMPLE_GENERATION", "cdr_file", filePath, undefined, {
        format,
        recordCount,
      })
    } else if (action === "process") {
      // Process all CDR files in input directory
      const results = await processAllCDRFiles()

      const totalRecords = results.reduce((sum, result) => sum + result.totalRecords, 0)
      const successfulRecords = results.reduce((sum, result) => sum + result.successfulRecords, 0)
      const errorRecords = results.reduce((sum, result) => sum + result.errorRecords, 0)

      response = {
        ...response,
        message: "CDR processing completed",
        summary: {
          files_processed: results.length,
          total_records: totalRecords,
          successful_records: successfulRecords,
          error_records: errorRecords,
          success_rate: totalRecords > 0 ? ((successfulRecords / totalRecords) * 100).toFixed(2) + "%" : "0%",
        },
        file_results: results.map((result) => ({
          file_name: result.fileName,
          format: result.format,
          total_records: result.totalRecords,
          successful_records: result.successfulRecords,
          error_records: result.errorRecords,
          processing_time_ms: result.processingTime,
        })),
      }

      logBusinessEvent("CDR_BATCH_PROCESSING", "cdr_batch", "all_files", undefined, {
        filesProcessed: results.length,
        totalRecords,
        successfulRecords,
        errorRecords,
      })
    } else {
      const duration = timer.end()
      logResponse(requestData, 400, duration, { error: "invalid_action" })

      return NextResponse.json(
        {
          success: false,
          error: "Invalid action",
          valid_actions: ["process", "generate_sample"],
        },
        { status: 400 }
      )
    }

    const duration = timer.end()
    logResponse(requestData, 200, duration, { action, filesProcessed: response.summary?.files_processed })

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    const duration = timer.end()
    logResponse(requestData, 500, duration, { error: "cdr_processing_failed" })

    return NextResponse.json(
      {
        success: false,
        error: "CDR processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Apply security middleware
export const GET = withSecurity(processCDRHandler)
export const POST = withSecurity(processCDRHandler)
