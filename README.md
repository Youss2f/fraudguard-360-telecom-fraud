# 🛡️ FraudGuard 360° - Telecom Fraud Detection Platform

> **Prototype Application** | Full-Stack Development | Analytics Dashboard | Modern Web Architecture

A prototype telecom fraud detection platform with CDR processing capabilities, fraud detection visualization, and monitoring features. This project demonstrates modern web development practices and provides a foundation for telecom fraud analysis.

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

## 🎯 **Platform Capabilities**

### **🏆 Modern Architecture**
- **Development Pipeline**: CI/CD setup with Docker containerization
- **Web Application**: Next.js frontend with API routes for data handling
- **Security Features**: Authentication, authorization, and input validation
- **Performance Optimization**: Data caching and efficient rendering
- **Monitoring**: Basic Prometheus metrics and Grafana dashboards

### **🔍 Fraud Detection Features**
- **CDR Visualization**: Display and analysis of call detail records
- **Pattern Recognition**: Identification of suspicious calling patterns
- **Risk Assessment**: Basic scoring system for potential fraud
- **Anomaly Highlighting**: Visual indicators for unusual activity
- **Alert Management**: System for tracking and managing fraud alerts

### **📊 Data Processing**
- **CDR Handling**: Support for CSV format with structured processing
- **Dashboard Updates**: Periodic data refresh for dashboard components
- **Database Storage**: PostgreSQL with Prisma ORM for data management
- **Session Management**: Redis for user sessions and basic caching
- **Data Protection**: Encryption for sensitive subscriber information

### **📊 Production API Endpoints**
1. **🔍 Subscriber Analytics** - `/api/subscribers/[id]` - Complete subscriber data retrieval
2. **🚨 Fraud Detection** - `/api/fraud/detect/[id]` - Real-time fraud analysis
3. **📁 CDR Processing** - `/api/cdr/process` - Telecom data file processing
4. **📡 Real-Time Streaming** - `/api/streaming/sse` - Live event streaming
5. **📊 Performance Monitoring** - `/api/monitoring/performance` - System metrics
6. **🏥 Health Checks** - `/api/health` - Comprehensive system health
7. **🔐 Authentication** - `/api/auth/*` - JWT-based authentication system

### **🎯 Enterprise Features**
- **Production Deployment**: Docker containers with Kubernetes orchestration
- **CI/CD Pipeline**: Automated testing, building, and deployment via GitHub Actions
- **Monitoring Stack**: Prometheus metrics with Grafana dashboards and alerting
- **Security Hardening**: Rate limiting, input validation, data encryption, audit logging
- **Performance Optimization**: Redis caching, database indexing, connection pooling
- **Real-Time Processing**: Server-Sent Events for live dashboard updates
- **Data Processing**: Multi-format CDR file processing with error handling
- **GDPR Compliance**: Data anonymization, export, and retention policies

## 🚀 **Live Demo & Screenshots**

### **🌐 Try the Live Demo**
```bash
# Clone and run locally
git clone <repository-url>
cd fraudguard-360
npm install
npm run dev
# Open http://localhost:3000
```

### **📱 Demo Credentials & Test Data**
Use these sample inputs to explore the full functionality:

| Search Type | Sample Input | Description |
|-------------|--------------|-------------|
| **MSISDN** | `+1234567890` | High-risk subscriber with international activity |
| **MSISDN** | `+1987654321` | Bulk SMS patterns and device switching |
| **IMSI** | `310150123456789` | Tethering detection and suspicious payments |
| **IMSI** | `310150987654321` | Normal user profile for comparison |

### **🎬 Key Demo Features to Showcase**
1. **Landing Page** → Professional marketing site with feature highlights
2. **Search Interface** → Clean, intuitive subscriber lookup
3. **Risk Analysis** → Watch fraud risk scoring with progress indicators
4. **Interactive Dashboard** → Click IMEIs to see cross-card highlighting
5. **Advanced Filtering** → Date ranges, locations, event types
6. **Export Functions** → Generate professional PDF/CSV reports
7. **Real-Time Monitoring** → Live fraud detection simulation
8. **Geospatial Analysis** → Interactive maps with fraud hotspots

## 🛠️ **Technology Stack & Architecture**

### **Frontend**
- **Framework**: Next.js 14.1.0 with App Router and React 18.2.0
- **Language**: TypeScript 5.0 with type checking
- **Styling**: Tailwind CSS 3.3.3 with component library
- **Components**: shadcn/ui with Radix UI primitives
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for UI elements
- **State Management**: React hooks for component state

### **Development Practices**
- **Code Quality**: ESLint and Prettier for consistent formatting
- **Performance**: Basic Next.js optimization techniques
- **Accessibility**: Keyboard navigation support
- **Responsive Design**: Mobile and desktop layouts
- **Dark Mode**: Theme switching capability

### **Data Architecture**
- **Mock Data**: Simulation of telecom data for development
- **Fraud Visualization**: Visual representation of suspicious patterns
- **Type Definitions**: TypeScript interfaces for data structures
- **Dashboard Updates**: Periodic data refresh for monitoring

## 🎓 **Intern Project Showcase**

### **💼 Professional Skills Demonstrated**

#### **Full-Stack Development**
- **Frontend Mastery**: Advanced React patterns, custom hooks, and performance optimization
- **TypeScript Expertise**: Comprehensive type safety with complex interface definitions
- **Modern Tooling**: Next.js App Router, Tailwind CSS, and component libraries
- **State Management**: Efficient data flow and component communication

#### **Industry Domain Knowledge**
- **Telecom Understanding**: CDR processing, IMSI/MSISDN relationships, network topology
- **Fraud Detection**: Risk scoring algorithms, pattern recognition, anomaly detection
- **Data Analytics**: Time-series analysis, behavioral modeling, statistical insights
- **Security Awareness**: Authentication patterns, data protection, audit trails

#### **Software Engineering Practices**
- **Clean Architecture**: Modular component design with separation of concerns
- **Code Quality**: Consistent formatting, meaningful naming, comprehensive documentation
- **Performance**: Optimized rendering, lazy loading, and efficient data structures
- **User Experience**: Intuitive interfaces, responsive design, accessibility compliance

### **🚀 Quick Start Guide**

#### **Prerequisites**
- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- **Modern browser** with ES2020+ support

#### **Installation & Setup**

**🎮 Option 1: Demo Mode (Mock Data)**
```bash
# 1. Clone the repository
git clone <repository-url>
cd fraudguard-360

# 2. Run automated setup
npm install --legacy-peer-deps
npm run setup
# Choose option 1 for Demo Mode

# 3. Start development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
```

**🏗️ Option 2: Production Mode (Real Database)**
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Set up PostgreSQL database
createdb fraudguard_dev

# 3. Configure environment
cp .env.example .env.local
# Edit DATABASE_URL in .env.local

# 4. Set up database
npm run db:generate
npm run db:push
npm run db:seed

# 5. Start development
npm run dev
```

**🐳 Option 3: Docker Deployment**
```bash
# Local deployment with full stack
docker-compose up -d

# Access points:
# - App: http://localhost:3000
# - Grafana: http://localhost:3001
# - Prometheus: http://localhost:9090
```

**⚙️ Environment Configuration**
- **Demo Mode**: Uses mock data, no database required
- **Production Mode**: Uses PostgreSQL database with real data
- **Feature Flags**: Control data sources via environment variables

---

## 📚 **Documentation**

### **📖 Comprehensive Documentation Suite**
This project includes comprehensive documentation organized by category:

#### **🚀 Quick Access**
| Category | Primary Document | Description |
|----------|------------------|-------------|
| **📚 Overview** | [Documentation Hub](./docs/README.md) | Complete documentation index and navigation |
| **🏗️ Technical** | [System Architecture](./docs/technical/architecture.md) | System design and technical architecture |
| **🔌 API** | [API Reference](./docs/api/README.md) | Complete REST API documentation |
| **🚀 Operations** | [Deployment Guide](./docs/operations/deployment.md) | All deployment methods and environments |
| **🛡️ Security** | [Security Guide](./docs/security/README.md) | Security implementation and best practices |
| **👨‍💻 Development** | [Development Guide](./docs/development/README.md) | Developer setup and guidelines |

#### **📁 Documentation Structure**
```
📚 docs/
├── 🏗️ technical/          # Architecture, performance, testing
├── 🔌 api/                # API documentation and examples
├── 🚀 operations/         # Deployment, monitoring, maintenance
├── 🛡️ security/           # Security, compliance, incident response
├── 👨‍💻 development/       # Development guides and standards
├── 🔗 integrations/       # SDK, webhooks, third-party integrations
└── 📊 project/            # Changelog, status, summaries
```

### **🎯 Quick Start by Role**
- **🆕 New Users**: [Documentation Hub](./docs/README.md) → [Project Overview](./README.md)
- **👨‍💻 Developers**: [Development Guide](./docs/development/README.md) → [API Docs](./docs/api/README.md)
- **🔧 DevOps**: [Deployment Guide](./docs/operations/deployment.md) → [Monitoring](./docs/operations/monitoring.md)
- **🛡️ Security**: [Security Guide](./docs/security/README.md) → [Architecture](./docs/technical/architecture.md)

---

## 📜 **Available Scripts**

### **Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup        # Interactive setup wizard
```

### **Database (Production Mode)**
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed with sample data
npm run db:studio    # Open Prisma Studio
```

### **Code Quality**
```bash
npm run lint         # Check code quality
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # TypeScript type checking
npm run quality      # Run all quality checks
```

### **Testing**
```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:ci      # Run tests for CI/CD
```

### **Deployment**
```bash
./scripts/deploy.sh local      # Deploy locally
./scripts/deploy.sh staging    # Deploy to staging
./scripts/deploy.sh production # Deploy to production
```

#### **🎯 Guided Demo Walkthrough**

1. **Start at Landing Page** (`/`) - Professional marketing presentation
2. **Search Interface** (`/search`) - Enter sample MSISDN: `+1234567890`
3. **Risk Analysis** - Watch fraud risk scoring progress
4. **Dashboard Exploration** - Click different IMEIs to see highlighting
5. **Advanced Features** - Try filters, exports, and monitoring features

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                 # Main search page
│   └── layout.tsx              # Root layout
├── components/
│   ├── subscriber-dashboard.tsx # Main dashboard
│   ├── cards/                  # Dashboard cards
│   │   ├── subscriber-overview-card.tsx
│   │   ├── overall-activity-card.tsx
│   │   ├── local-call-activity-card.tsx
│   │   ├── sms-activity-card.tsx
│   │   ├── international-call-card.tsx
│   │   ├── data-usage-card.tsx
│   │   ├── dealer-association-card.tsx
│   │   └── recharge-payment-card.tsx
│   ├── date-range-picker.tsx   # Filter components
│   ├── location-filter.tsx
│   ├── event-type-filter.tsx
│   └── export-dialog.tsx       # Export functionality
├── types/
│   └── subscriber.ts           # TypeScript definitions
├── lib/
│   └── mock-data.ts           # Mock data generator
└── README.md
\`\`\`

## Data Integration

### Mock Data Structure
The application uses a comprehensive mock data structure that mirrors real telecom data:

\`\`\`typescript
interface SubscriberData {
  overview: SubscriberOverview
  overallActivity: OverallActivity
  localCallActivity: LocalCallActivity
  smsActivity: SmsActivity
  internationalCallActivity: InternationalCallActivity
  dataUsage: DataUsage
  dealerAssociation: DealerAssociation
  rechargePayment: RechargePayment
  riskScore: number
  lastUpdated: string
}
\`\`\`

### Real Data Integration
To integrate with real data sources:

1. **Replace mock data generator** in `lib/mock-data.ts`
2. **Update API calls** in `components/subscriber-dashboard.tsx`
3. **Configure environment variables** for database connections
4. **Implement authentication** and authorization

### Environment Variables
Create a `.env.local` file:

\`\`\`env
# Database Configuration
DATABASE_URL=your_database_connection_string
API_BASE_URL=your_api_endpoint

# Authentication (if needed)
NEXTAUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000

# External Services
FRAUD_SCORING_API_KEY=your_fraud_api_key
\`\`\`

## Fraud Analytics Features

### Risk Scoring
- Automated risk calculation based on activity patterns
- Configurable risk thresholds and alerts
- Visual risk indicators throughout the dashboard

### Pattern Detection
- **Bulk SMS detection** - Identifies promotional/spam patterns
- **Tethering analysis** - Detects unauthorized device sharing
- **High-risk destinations** - Flags calls to suspicious countries
- **Device switching** - Tracks IMEI changes and patterns

### Cross-Reference Analysis
- **IMEI highlighting** - Visual correlation across all activities
- **Location clustering** - Identifies movement patterns
- **Time-based analysis** - Peak activity detection
- **Dealer correlation** - Suspicious activation patterns

## Export Capabilities

### CSV Export
- Raw data export for external analysis
- Configurable section selection
- Timestamp and metadata inclusion

### PDF Export
- Formatted reports with charts and visualizations
- Executive summary format
- Print-ready layouts

## Deployment

### Production Build
\`\`\`bash
npm run build
npm start
\`\`\`

### Docker Deployment
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### Environment Setup
- Configure production database connections
- Set up authentication providers
- Configure external API integrations
- Set up monitoring and logging

## Security Considerations

### Data Protection
- Implement proper authentication and authorization
- Use encrypted connections for all data transfers
- Implement audit logging for all access
- Follow telecom data privacy regulations

### Access Control
- Role-based access control (RBAC)
- Session management and timeout
- IP whitelisting for sensitive operations
- Multi-factor authentication for admin access

## Performance Optimization

### Frontend
- Lazy loading of dashboard cards
- Virtual scrolling for large datasets
- Optimized chart rendering
- Responsive image loading

### Backend Integration
- Implement caching for frequently accessed data
- Use database indexing for search operations
- Implement pagination for large result sets
- Consider CDN for static assets

## Future Enhancements

### Risk Scoring Integration
- Machine learning fraud scoring
- Anomaly detection algorithms
- Predictive risk modeling
- Automated alert generation

### Advanced Analytics
- Geospatial analysis and mapping
- Social network analysis
- Behavioral pattern recognition
- Enhanced monitoring dashboards

### Integration Capabilities
- REST API for external systems
- Webhook support for event-driven updates
- SIEM integration for security monitoring
- Reporting automation

## Support and Maintenance

### Monitoring
- Application performance monitoring
- Error tracking and alerting
- User activity analytics
- System health dashboards

### Updates
- Regular security updates
- Feature enhancement releases
- Bug fixes and optimizations
- Documentation updates

## License

This project is designed for telecom fraud investigation purposes. Ensure compliance with local data protection and privacy regulations.

---

**Built for Telecom Fraud Analysts** - Comprehensive, fast, and actionable subscriber intelligence.
\`\`\`

Let's also create a package.json file to complete the setup:
