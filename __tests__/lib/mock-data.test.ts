import { generateMockData } from '@/lib/mock-data'
import { generateMockDataWithAI } from '@/lib/mock-data-ai'
import type { SubscriberData } from '@/types/subscriber'

describe('Mock Data Generation', () => {
  describe('generateMockData', () => {
    it('should generate valid subscriber data for MSISDN', () => {
      const searchQuery = '+1234567890'
      const searchType = 'msisdn'
      
      const result = generateMockData(searchQuery, searchType)
      
      expect(result).toBeDefined()
      expect(result.overview.msisdn).toBe(searchQuery)
      expect(result.overview.imsi).toBeDefined()
      expect(result.overview.currentImei).toBeDefined()
      expect(result.overview.status).toBe('Active')
    })

    it('should generate valid subscriber data for IMSI', () => {
      const searchQuery = '310150123456789'
      const searchType = 'imsi'
      
      const result = generateMockData(searchQuery, searchType)
      
      expect(result).toBeDefined()
      expect(result.overview.imsi).toBe(searchQuery)
      expect(result.overview.msisdn).toBeDefined()
      expect(result.overview.currentImei).toBeDefined()
    })

    it('should generate consistent data structure', () => {
      const result = generateMockData('+1234567890', 'msisdn')
      
      // Check all required sections exist
      expect(result.overview).toBeDefined()
      expect(result.overallActivity).toBeDefined()
      expect(result.localCallActivity).toBeDefined()
      expect(result.smsActivity).toBeDefined()
      expect(result.internationalCallActivity).toBeDefined()
      expect(result.dataUsage).toBeDefined()
      expect(result.dealerAssociation).toBeDefined()
      expect(result.rechargePayment).toBeDefined()
      expect(result.riskScore).toBeGreaterThanOrEqual(0)
      expect(result.riskScore).toBeLessThanOrEqual(100)
    })

    it('should generate realistic IMEI numbers', () => {
      const result = generateMockData('+1234567890', 'msisdn')
      
      expect(result.overview.deviceInfo.imeiHistory).toHaveLength(3)
      result.overview.deviceInfo.imeiHistory.forEach(imei => {
        expect(imei).toMatch(/^\d{15}$/) // 15 digits
      })
    })

    it('should generate valid timestamps', () => {
      const result = generateMockData('+1234567890', 'msisdn')
      
      expect(new Date(result.overview.activationDate)).toBeInstanceOf(Date)
      expect(new Date(result.overview.lastActivity)).toBeInstanceOf(Date)
      expect(new Date(result.lastUpdated)).toBeInstanceOf(Date)
    })
  })

  describe('generateMockDataWithAI', () => {
    it('should include AI analysis in the result', () => {
      const result = generateMockDataWithAI('+1234567890', 'msisdn')
      
      expect(result.aiAnalysis).toBeDefined()
      expect(result.aiAnalysis.overallRiskScore).toBeGreaterThanOrEqual(0)
      expect(result.aiAnalysis.overallRiskScore).toBeLessThanOrEqual(100)
      expect(result.aiAnalysis.confidence).toBeGreaterThanOrEqual(0)
      expect(result.aiAnalysis.confidence).toBeLessThanOrEqual(100)
    })

    it('should generate valid risk scores', () => {
      const result = generateMockDataWithAI('+1234567890', 'msisdn')
      
      expect(result.aiAnalysis.behavioralScore).toBeGreaterThanOrEqual(0)
      expect(result.aiAnalysis.behavioralScore).toBeLessThanOrEqual(100)
      expect(result.aiAnalysis.networkScore).toBeGreaterThanOrEqual(0)
      expect(result.aiAnalysis.networkScore).toBeLessThanOrEqual(100)
      expect(result.aiAnalysis.deviceScore).toBeGreaterThanOrEqual(0)
      expect(result.aiAnalysis.deviceScore).toBeLessThanOrEqual(100)
      expect(result.aiAnalysis.velocityScore).toBeGreaterThanOrEqual(0)
      expect(result.aiAnalysis.velocityScore).toBeLessThanOrEqual(100)
    })

    it('should generate risk factors and recommendations', () => {
      const result = generateMockDataWithAI('+1234567890', 'msisdn')
      
      expect(Array.isArray(result.aiAnalysis.riskFactors)).toBe(true)
      expect(Array.isArray(result.aiAnalysis.recommendations)).toBe(true)
      expect(result.aiAnalysis.recommendations.length).toBeGreaterThan(0)
    })

    it('should generate model predictions', () => {
      const result = generateMockDataWithAI('+1234567890', 'msisdn')
      
      expect(Array.isArray(result.aiAnalysis.modelPredictions)).toBe(true)
      expect(result.aiAnalysis.modelPredictions.length).toBeGreaterThan(0)
      
      result.aiAnalysis.modelPredictions.forEach(prediction => {
        expect(prediction.model).toBeDefined()
        expect(prediction.probability).toBeGreaterThanOrEqual(0)
        expect(prediction.probability).toBeLessThanOrEqual(100)
        expect(prediction.confidence).toBeGreaterThanOrEqual(0)
        expect(prediction.confidence).toBeLessThanOrEqual(100)
      })
    })

    it('should handle date range parameter', () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      }
      
      const result = generateMockDataWithAI('+1234567890', 'msisdn', dateRange)
      
      expect(result).toBeDefined()
      expect(result.aiAnalysis).toBeDefined()
    })
  })

  describe('Data Consistency', () => {
    it('should maintain IMEI consistency across all sections', () => {
      const result = generateMockData('+1234567890', 'msisdn')
      const allImeis = new Set<string>()
      
      // Collect IMEIs from overview
      result.overview.deviceInfo.imeiHistory.forEach(imei => allImeis.add(imei))
      
      // Check call logs
      result.localCallActivity.callLogs.forEach(log => {
        expect(allImeis.has(log.imei)).toBe(true)
      })
      
      // Check international calls
      result.internationalCallActivity.callLogs.forEach(log => {
        expect(allImeis.has(log.imei)).toBe(true)
      })
    })

    it('should generate realistic activity patterns', () => {
      const result = generateMockData('+1234567890', 'msisdn')
      
      // Check that activity stats are reasonable
      expect(result.overallActivity.summary.totalCalls).toBeGreaterThan(0)
      expect(result.overallActivity.summary.totalSms.sent).toBeGreaterThan(0)
      expect(result.overallActivity.summary.totalDataSessions).toBeGreaterThan(0)
      
      // Check time series data
      expect(result.overallActivity.timeSeries.data).toHaveLength(30)
      result.overallActivity.timeSeries.data.forEach((dataPoint: any) => {
        expect(dataPoint.calls).toBeGreaterThanOrEqual(0)
        expect(dataPoint.sms).toBeGreaterThanOrEqual(0)
        expect(dataPoint.data).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
