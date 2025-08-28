import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create users
  const hashedPassword = await bcrypt.hash('demo123', 10)
  const adminPassword = await bcrypt.hash('admin123', 10)
  const demoPassword = await bcrypt.hash('demo', 10)

  const analyst = await prisma.user.upsert({
    where: { username: 'fraud.analyst' },
    update: {},
    create: {
      username: 'fraud.analyst',
      email: 'analyst@fraudguard.com',
      password: hashedPassword,
      role: 'ANALYST',
      permissions: ['view_dashboard', 'export_reports', 'manage_cases'],
    },
  })

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@fraudguard.com',
      password: adminPassword,
      role: 'ADMIN',
      permissions: ['view_dashboard', 'export_reports', 'manage_cases', 'admin_panel'],
    },
  })

  const demo = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@fraudguard.com',
      password: demoPassword,
      role: 'DEMO',
      permissions: ['view_dashboard'],
    },
  })

  console.log('✅ Created users:', { analyst: analyst.id, admin: admin.id, demo: demo.id })

  // Create sample subscribers
  const subscriber1 = await prisma.subscriber.create({
    data: {
      msisdn: '+1234567890',
      imsi: '310150123456789',
      imei: '123456789012345',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      networkOperator: 'Verizon',
      planType: 'Postpaid',
      activationDate: new Date('2023-01-15'),
      status: 'ACTIVE',
      riskScore: 25.5,
      riskLevel: 'LOW',
    },
  })

  const subscriber2 = await prisma.subscriber.create({
    data: {
      msisdn: '+1987654321',
      imsi: '310150987654321',
      imei: '987654321098765',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      networkOperator: 'AT&T',
      planType: 'Prepaid',
      activationDate: new Date('2023-06-20'),
      status: 'ACTIVE',
      riskScore: 75.8,
      riskLevel: 'HIGH',
    },
  })

  console.log('✅ Created subscribers:', { subscriber1: subscriber1.id, subscriber2: subscriber2.id })

  // Create sample call records
  await prisma.callRecord.createMany({
    data: [
      {
        subscriberId: subscriber1.id,
        callType: 'VOICE',
        direction: 'OUTGOING',
        callingNumber: '+1234567890',
        calledNumber: '+1555123456',
        startTime: new Date('2024-01-15T10:30:00Z'),
        endTime: new Date('2024-01-15T10:35:00Z'),
        duration: 300,
        cellId: 'CELL_001',
        latitude: 40.7128,
        longitude: -74.0060,
        cost: 0.25,
        currency: 'USD',
        riskScore: 15.0,
      },
      {
        subscriberId: subscriber2.id,
        callType: 'VOICE',
        direction: 'OUTGOING',
        callingNumber: '+1987654321',
        calledNumber: '+44207123456',
        startTime: new Date('2024-01-15T14:20:00Z'),
        endTime: new Date('2024-01-15T14:45:00Z'),
        duration: 1500,
        cellId: 'CELL_002',
        latitude: 34.0522,
        longitude: -118.2437,
        cost: 5.75,
        currency: 'USD',
        isInternational: true,
        riskScore: 85.0,
      },
    ],
  })

  // Create sample fraud alerts
  const fraudAlert = await prisma.fraudAlert.create({
    data: {
      subscriberId: subscriber2.id,
      alertType: 'VELOCITY_FRAUD',
      severity: 'HIGH',
      title: 'Unusual Call Volume Detected',
      description: 'Subscriber has made 50+ international calls in the last hour',
      riskScore: 85.0,
      confidence: 0.92,
      evidenceData: {
        callCount: 52,
        timeWindow: '1 hour',
        destinations: ['UK', 'Nigeria', 'India'],
        totalCost: 245.50,
      },
      status: 'OPEN',
    },
  })

  // Create sample investigation
  await prisma.investigation.create({
    data: {
      caseNumber: 'INV-2024-001',
      title: 'High-Risk International Calling Pattern',
      description: 'Investigation into unusual international calling behavior',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: analyst.id,
      createdBy: analyst.id,
      subscriberId: subscriber2.id,
      fraudAlertId: fraudAlert.id,
    },
  })

  // Create risk profiles
  await prisma.riskProfile.createMany({
    data: [
      {
        subscriberId: subscriber1.id,
        avgCallDuration: 180.5,
        avgDailyCalls: 12.3,
        avgDailySms: 25.7,
        avgDataUsage: 2048.5,
        homeLocationLat: 40.7128,
        homeLocationLng: -74.0060,
        usualLocations: [
          { lat: 40.7128, lng: -74.0060, name: 'Home' },
          { lat: 40.7589, lng: -73.9851, name: 'Work' },
        ],
        activeHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        activeDays: [1, 2, 3, 4, 5],
        velocityScore: 25.0,
        locationScore: 15.0,
        behaviorScore: 20.0,
        deviceScore: 10.0,
      },
      {
        subscriberId: subscriber2.id,
        avgCallDuration: 450.2,
        avgDailyCalls: 45.8,
        avgDailySms: 5.2,
        avgDataUsage: 512.3,
        homeLocationLat: 34.0522,
        homeLocationLng: -118.2437,
        usualLocations: [
          { lat: 34.0522, lng: -118.2437, name: 'Home' },
        ],
        activeHours: [0, 1, 2, 3, 22, 23],
        activeDays: [1, 2, 3, 4, 5, 6, 7],
        velocityScore: 85.0,
        locationScore: 70.0,
        behaviorScore: 90.0,
        deviceScore: 60.0,
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
