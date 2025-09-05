#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🚀 Setting up FraudGuard 360° Platform...\n")

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envLocalPath)) {
  console.log("📝 Creating .env.local from .env.example...")
  const envExamplePath = path.join(process.cwd(), ".env.example")
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envLocalPath)
    console.log("✅ .env.local created successfully")
  } else {
    console.log("⚠️  .env.example not found, creating basic .env.local...")
    const basicEnv = `# Basic configuration for demo mode
NODE_ENV=development
ENABLE_REAL_DATA=false
ENABLE_MOCK_DATA=true
ENABLE_DEMO_MODE=true
NEXTAUTH_SECRET=demo-secret-key-change-in-production
DATABASE_URL=postgresql://postgres:password@localhost:5432/fraudguard_dev
`
    fs.writeFileSync(envLocalPath, basicEnv)
    console.log("✅ Basic .env.local created")
  }
} else {
  console.log("✅ .env.local already exists")
}

// Check Node.js version
console.log("\n🔍 Checking Node.js version...")
const nodeVersion = process.version
console.log(`Node.js version: ${nodeVersion}`)

if (parseInt(nodeVersion.slice(1)) < 18) {
  console.log("⚠️  Warning: Node.js 18+ is recommended")
} else {
  console.log("✅ Node.js version is compatible")
}

// Install dependencies
console.log("\n📦 Installing dependencies...")
try {
  execSync("npm install --legacy-peer-deps", { stdio: "inherit" })
  console.log("✅ Dependencies installed successfully")
} catch (error) {
  console.log("❌ Failed to install dependencies:", error.message)
  process.exit(1)
}

// Check if user wants to set up database
console.log("\n🗄️  Database Setup Options:")
console.log("1. 🎮 Demo Mode (Mock Data) - Ready to use immediately")
console.log("2. 🏗️  Production Mode (Real Database) - Requires PostgreSQL setup")

const readline = require("readline")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question("\nWhich mode would you like to use? (1 for Demo, 2 for Production): ", (answer) => {
  if (answer === "2") {
    console.log("\n🏗️  Setting up Production Mode...")
    console.log("\n📋 Prerequisites for Production Mode:")
    console.log("1. PostgreSQL database running")
    console.log("2. Update DATABASE_URL in .env.local")
    console.log("3. Run: npm run db:generate")
    console.log("4. Run: npm run db:push")
    console.log("5. Run: npm run db:seed")

    // Update .env.local for production mode
    let envContent = fs.readFileSync(envLocalPath, "utf8")
    envContent = envContent.replace("ENABLE_REAL_DATA=false", "ENABLE_REAL_DATA=true")
    fs.writeFileSync(envLocalPath, envContent)

    console.log("\n✅ Updated .env.local for production mode")
    console.log("\n⚠️  Please ensure PostgreSQL is running and update DATABASE_URL before proceeding")
  } else {
    console.log("\n🎮 Demo Mode Selected - Using mock data")

    // Ensure demo mode settings
    let envContent = fs.readFileSync(envLocalPath, "utf8")
    envContent = envContent.replace("ENABLE_REAL_DATA=true", "ENABLE_REAL_DATA=false")
    fs.writeFileSync(envLocalPath, envContent)

    console.log("✅ Configured for demo mode")
  }

  console.log("\n🎯 Setup Complete!")
  console.log("\n🚀 Quick Start Commands:")
  console.log("• npm run dev          - Start development server")
  console.log("• npm run build        - Build for production")
  console.log("• npm run test         - Run tests")
  console.log("• npm run lint         - Check code quality")

  if (answer === "2") {
    console.log("\n🗄️  Database Commands (Production Mode):")
    console.log("• npm run db:generate  - Generate Prisma client")
    console.log("• npm run db:push      - Push schema to database")
    console.log("• npm run db:migrate   - Run database migrations")
    console.log("• npm run db:seed      - Seed database with sample data")
    console.log("• npm run db:studio    - Open Prisma Studio")
  }

  console.log("\n📚 Documentation:")
  console.log("• README.md            - Project overview")
  console.log("• API_DOCUMENTATION.md - API reference")
  console.log("• DEPLOYMENT.md        - Deployment guide")

  console.log("\n🎉 Ready to start! Run: npm run dev")

  rl.close()
})
