import fs from "fs"
import path from "path"
import csv from "csv-parser"
import xml2js from "xml2js"
import { prisma, shouldUseRealData } from "./database"
import { logBusinessEvent, logError, createTimer } from "./logger"
import { trackDbQuery } from "./performance"
import { secureDataObject } from "./encryption"

// CDR processing configuration
const CDR_CONFIG = {
  enableProcessing: process.env.ENABLE_CDR_PROCESSING !== "false",
  inputDirectory: process.env.CDR_INPUT_DIR || "./data/cdr/input",
  processedDirectory: process.env.CDR_PROCESSED_DIR || "./data/cdr/processed",
  errorDirectory: process.env.CDR_ERROR_DIR || "./data/cdr/error",
  batchSize: parseInt(process.env.CDR_BATCH_SIZE || "1000"),
  maxFileSize: parseInt(process.env.CDR_MAX_FILE_SIZE || "100"), // MB
}

// CDR record interface
interface CDRRecord {
  msisdn: string
  imsi?: string
  callType: "VOICE" | "VIDEO" | "CONFERENCE"
  direction: "INCOMING" | "OUTGOING"
  callingNumber: string
  calledNumber: string
  startTime: Date
  endTime?: Date
  duration?: number
  cellId?: string
  locationAreaCode?: string
  latitude?: number
  longitude?: number
  cost?: number
  currency?: string
  isRoaming?: boolean
  isInternational?: boolean
}

// CDR file formats
enum CDRFormat {
  CSV = "csv",
  XML = "xml",
  JSON = "json",
  ASN1 = "asn1", // Placeholder for ASN.1 support
}

// Processing statistics
interface ProcessingStats {
  totalRecords: number
  successfulRecords: number
  errorRecords: number
  duplicateRecords: number
  processingTime: number
  fileName: string
  format: CDRFormat
}

// Initialize CDR directories
function initializeCDRDirectories(): void {
  const directories = [CDR_CONFIG.inputDirectory, CDR_CONFIG.processedDirectory, CDR_CONFIG.errorDirectory]

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      // Created CDR directory
    }
  })
}

// Detect CDR file format
function detectCDRFormat(filePath: string): CDRFormat {
  const extension = path.extname(filePath).toLowerCase()

  switch (extension) {
    case ".csv":
      return CDRFormat.CSV
    case ".xml":
      return CDRFormat.XML
    case ".json":
      return CDRFormat.JSON
    case ".asn1":
    case ".ber":
      return CDRFormat.ASN1
    default:
      throw new Error(`Unsupported CDR format: ${extension}`)
  }
}

// Parse CSV CDR file
async function parseCSVCDR(filePath: string): Promise<CDRRecord[]> {
  return new Promise((resolve, reject) => {
    const records: CDRRecord[] = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const record: CDRRecord = {
            msisdn: row.msisdn || row.calling_number,
            imsi: row.imsi,
            callType: row.call_type?.toUpperCase() || "VOICE",
            direction: row.direction?.toUpperCase() || "OUTGOING",
            callingNumber: row.calling_number,
            calledNumber: row.called_number,
            startTime: new Date(row.start_time),
            endTime: row.end_time ? new Date(row.end_time) : undefined,
            duration: row.duration ? parseInt(row.duration) : undefined,
            cellId: row.cell_id,
            locationAreaCode: row.location_area_code,
            latitude: row.latitude ? parseFloat(row.latitude) : undefined,
            longitude: row.longitude ? parseFloat(row.longitude) : undefined,
            cost: row.cost ? parseFloat(row.cost) : undefined,
            currency: row.currency || "USD",
            isRoaming: row.is_roaming === "true" || row.is_roaming === "1",
            isInternational: row.is_international === "true" || row.is_international === "1",
          }
          records.push(record)
        } catch (error) {
          console.error("Error parsing CSV row:", error, row)
        }
      })
      .on("end", () => resolve(records))
      .on("error", reject)
  })
}

// Parse XML CDR file
async function parseXMLCDR(filePath: string): Promise<CDRRecord[]> {
  const xmlContent = fs.readFileSync(filePath, "utf8")
  const parser = new xml2js.Parser()

  try {
    const result = await parser.parseStringPromise(xmlContent)
    const records: CDRRecord[] = []

    // Assuming XML structure: <cdrs><cdr>...</cdr></cdrs>
    const cdrNodes = result.cdrs?.cdr || []

    for (const cdr of cdrNodes) {
      const record: CDRRecord = {
        msisdn: cdr.msisdn?.[0] || cdr.calling_number?.[0],
        imsi: cdr.imsi?.[0],
        callType: cdr.call_type?.[0]?.toUpperCase() || "VOICE",
        direction: cdr.direction?.[0]?.toUpperCase() || "OUTGOING",
        callingNumber: cdr.calling_number?.[0],
        calledNumber: cdr.called_number?.[0],
        startTime: new Date(cdr.start_time?.[0]),
        endTime: cdr.end_time?.[0] ? new Date(cdr.end_time[0]) : undefined,
        duration: cdr.duration?.[0] ? parseInt(cdr.duration[0]) : undefined,
        cellId: cdr.cell_id?.[0],
        locationAreaCode: cdr.location_area_code?.[0],
        latitude: cdr.latitude?.[0] ? parseFloat(cdr.latitude[0]) : undefined,
        longitude: cdr.longitude?.[0] ? parseFloat(cdr.longitude[0]) : undefined,
        cost: cdr.cost?.[0] ? parseFloat(cdr.cost[0]) : undefined,
        currency: cdr.currency?.[0] || "USD",
        isRoaming: cdr.is_roaming?.[0] === "true",
        isInternational: cdr.is_international?.[0] === "true",
      }
      records.push(record)
    }

    return records
  } catch (error) {
    throw new Error(`Failed to parse XML CDR: ${error}`)
  }
}

// Parse JSON CDR file
async function parseJSONCDR(filePath: string): Promise<CDRRecord[]> {
  const jsonContent = fs.readFileSync(filePath, "utf8")

  try {
    const data = JSON.parse(jsonContent)
    const records = Array.isArray(data) ? data : data.records || []

    return records.map((record: any) => ({
      msisdn: record.msisdn || record.calling_number,
      imsi: record.imsi,
      callType: record.call_type?.toUpperCase() || "VOICE",
      direction: record.direction?.toUpperCase() || "OUTGOING",
      callingNumber: record.calling_number,
      calledNumber: record.called_number,
      startTime: new Date(record.start_time),
      endTime: record.end_time ? new Date(record.end_time) : undefined,
      duration: record.duration,
      cellId: record.cell_id,
      locationAreaCode: record.location_area_code,
      latitude: record.latitude,
      longitude: record.longitude,
      cost: record.cost,
      currency: record.currency || "USD",
      isRoaming: record.is_roaming === true,
      isInternational: record.is_international === true,
    }))
  } catch (error) {
    throw new Error(`Failed to parse JSON CDR: ${error}`)
  }
}

// Parse CDR file based on format
async function parseCDRFile(filePath: string, format: CDRFormat): Promise<CDRRecord[]> {
  switch (format) {
    case CDRFormat.CSV:
      return parseCSVCDR(filePath)
    case CDRFormat.XML:
      return parseXMLCDR(filePath)
    case CDRFormat.JSON:
      return parseJSONCDR(filePath)
    case CDRFormat.ASN1:
      throw new Error("ASN.1 format not yet implemented")
    default:
      throw new Error(`Unsupported CDR format: ${format}`)
  }
}

// Process CDR records into database
async function processCDRRecords(records: CDRRecord[], fileName: string): Promise<ProcessingStats> {
  if (!shouldUseRealData()) {
    // Mock processing for demo mode
    return {
      totalRecords: records.length,
      successfulRecords: records.length,
      errorRecords: 0,
      duplicateRecords: 0,
      processingTime: Math.random() * 1000 + 500,
      fileName,
      format: CDRFormat.CSV,
    }
  }

  const timer = createTimer()
  const stats: ProcessingStats = {
    totalRecords: records.length,
    successfulRecords: 0,
    errorRecords: 0,
    duplicateRecords: 0,
    processingTime: 0,
    fileName,
    format: CDRFormat.CSV,
  }

  try {
    // Process records in batches
    for (let i = 0; i < records.length; i += CDR_CONFIG.batchSize) {
      const batch = records.slice(i, i + CDR_CONFIG.batchSize)

      for (const record of batch) {
        try {
          // Find or create subscriber
          let subscriber = await prisma.subscriber.findFirst({
            where: {
              OR: [{ msisdn: record.msisdn }, { imsi: record.imsi || "" }],
            },
          })

          if (!subscriber) {
            // Create new subscriber
            const secureData = secureDataObject({
              msisdn: record.msisdn,
              imsi: record.imsi,
              networkOperator: "Unknown",
              status: "ACTIVE",
              riskScore: 0,
              riskLevel: "LOW",
            })

            subscriber = await prisma.subscriber.create({
              data: secureData as any,
            })
          }

          // Create call record
          await prisma.callRecord.create({
            data: {
              subscriberId: subscriber.id,
              callType: record.callType,
              direction: record.direction,
              callingNumber: record.callingNumber,
              calledNumber: record.calledNumber,
              startTime: record.startTime,
              endTime: record.endTime,
              duration: record.duration,
              cellId: record.cellId,
              locationAreaCode: record.locationAreaCode,
              latitude: record.latitude,
              longitude: record.longitude,
              cost: record.cost,
              currency: record.currency,
              isRoaming: record.isRoaming || false,
              isInternational: record.isInternational || false,
              riskScore: 0, // Will be calculated by fraud detection
            },
          })

          stats.successfulRecords++
        } catch (error) {
          console.error("Error processing CDR record:", error, record)
          stats.errorRecords++
        }
      }
    }

    stats.processingTime = timer.end()
    trackDbQuery("INSERT_BATCH", "call_records", stats.processingTime, true)

    logBusinessEvent("CDR_PROCESSING", "cdr_file", fileName, undefined, stats)

    return stats
  } catch (error) {
    stats.processingTime = timer.end()
    logError(error as Error, "CDR_PROCESSING", { fileName, stats })
    throw error
  }
}

// Process single CDR file
export async function processCDRFile(filePath: string): Promise<ProcessingStats> {
  if (!CDR_CONFIG.enableProcessing) {
    throw new Error("CDR processing is disabled")
  }

  const fileName = path.basename(filePath)
  const timer = createTimer()

  try {
    // Check file size
    const fileStats = fs.statSync(filePath)
    const fileSizeMB = fileStats.size / (1024 * 1024)

    if (fileSizeMB > CDR_CONFIG.maxFileSize) {
      throw new Error(`File too large: ${fileSizeMB}MB (max: ${CDR_CONFIG.maxFileSize}MB)`)
    }

    // Detect and parse CDR format
    const format = detectCDRFormat(filePath)
    const records = await parseCDRFile(filePath, format)

    // Process records
    const stats = await processCDRRecords(records, fileName)
    stats.format = format

    // Move file to processed directory
    const processedPath = path.join(CDR_CONFIG.processedDirectory, fileName)
    fs.renameSync(filePath, processedPath)

    // CDR file processed successfully
    return stats
  } catch (error) {
    // Move file to error directory
    const errorPath = path.join(CDR_CONFIG.errorDirectory, fileName)
    try {
      fs.renameSync(filePath, errorPath)
    } catch (moveError) {
      console.error("Failed to move error file:", moveError)
    }

    logError(error as Error, "CDR_FILE_PROCESSING", { fileName })
    throw error
  }
}

// Process all CDR files in input directory
export async function processAllCDRFiles(): Promise<ProcessingStats[]> {
  initializeCDRDirectories()

  if (!fs.existsSync(CDR_CONFIG.inputDirectory)) {
    // CDR input directory does not exist
    return []
  }

  const files = fs.readdirSync(CDR_CONFIG.inputDirectory)
  const cdrFiles = files.filter((file) => file.endsWith(".csv") || file.endsWith(".xml") || file.endsWith(".json"))

  const results: ProcessingStats[] = []

  for (const file of cdrFiles) {
    const filePath = path.join(CDR_CONFIG.inputDirectory, file)

    try {
      const stats = await processCDRFile(filePath)
      results.push(stats)
    } catch (error) {
      console.error(`Failed to process CDR file ${file}:`, error)
    }
  }

  return results
}

// Generate sample CDR file for testing
export function generateSampleCDRFile(format: CDRFormat = CDRFormat.CSV, recordCount: number = 100): string {
  initializeCDRDirectories()

  const fileName = `sample_cdr_${Date.now()}.${format}`
  const filePath = path.join(CDR_CONFIG.inputDirectory, fileName)

  const sampleRecords = []

  for (let i = 0; i < recordCount; i++) {
    const record = {
      msisdn: `+1555${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      imsi: `310150${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
      call_type: "VOICE",
      direction: Math.random() > 0.5 ? "OUTGOING" : "INCOMING",
      calling_number: `+1555${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      called_number: `+1555${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      start_time: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      duration: Math.floor(Math.random() * 3600),
      cell_id: `CELL_${Math.floor(Math.random() * 1000)}`,
      cost: (Math.random() * 10).toFixed(2),
      currency: "USD",
      is_roaming: Math.random() > 0.9,
      is_international: Math.random() > 0.8,
    }
    sampleRecords.push(record)
  }

  if (format === CDRFormat.CSV) {
    const headers = Object.keys(sampleRecords[0]).join(",")
    const rows = sampleRecords.map((record) => Object.values(record).join(","))
    const csvContent = [headers, ...rows].join("\n")
    fs.writeFileSync(filePath, csvContent)
  } else if (format === CDRFormat.JSON) {
    fs.writeFileSync(filePath, JSON.stringify(sampleRecords, null, 2))
  }

  // Generated sample CDR file
  return filePath
}

// Export configuration and types
export { CDR_CONFIG, CDRFormat }
export type { CDRRecord, ProcessingStats }
