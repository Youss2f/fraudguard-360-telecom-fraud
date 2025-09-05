# FraudGuard 360° - Advanced Telecom Fraud Detection System

<div align="center">
  <img src="https://via.placeholder.com/800x400/1e40af/ffffff?text=FraudGuard+360%C2%B0" alt="FraudGuard 360° Dashboard" />
  
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-username/fraudguard-360-telecom-fraud)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black.svg)](https://nextjs.org/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
</div>

## 🎯 Overview

FraudGuard 360° is a comprehensive, real-time telecom fraud detection system designed to identify and prevent fraudulent activities in telecommunications networks. Built as a Proof of Concept (PFA) project, it demonstrates advanced fraud detection capabilities using AI-powered analytics, real-time monitoring, and comprehensive subscriber behavior analysis.

### Key Features

- 🔍 **Real-time Fraud Detection**: AI-powered algorithms analyze subscriber behavior patterns
- 📊 **Advanced Analytics**: Comprehensive dashboards with interactive visualizations
- 🚨 **Risk Scoring**: Multi-dimensional risk assessment with configurable thresholds
- 📱 **Subscriber Profiling**: Detailed analysis of call patterns, device usage, and location data
- 🌐 **International Call Monitoring**: Specialized detection for international fraud patterns
- 💳 **Payment Analysis**: Recharge and payment pattern analysis
- 🗺️ **Geographic Analysis**: Location-based fraud detection with interactive maps
- 📈 **Performance Monitoring**: Real-time system health and performance metrics
- 🔐 **Security-First Design**: Comprehensive security measures and audit logging

## 🏗️ Tech Stack & Architecture

### Frontend
- **Next.js 14.1.0** - React framework with App Router
- **TypeScript 5.9.2** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Database ORM and migrations
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing

### Infrastructure & DevOps
- **Docker & Docker Compose** - Containerization
- **Kubernetes** - Container orchestration (optional)
- **Prometheus & Grafana** - Monitoring and observability
- **Nginx** - Reverse proxy and load balancing
- **Jest** - Testing framework
- **ESLint & Prettier** - Code quality and formatting

### Security & Compliance
- **Helmet.js** - Security headers
- **Rate Limiting** - API protection
- **Input Validation** - Comprehensive data validation
- **Audit Logging** - Complete activity tracking
- **GDPR Compliance** - Data protection measures

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Docker** and **Docker Compose** (optional)
- **PostgreSQL** 14 or higher (if not using Docker)
- **Redis** 6.0 or higher (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fraudguard-360-telecom-fraud.git
   cd fraudguard-360-telecom-fraud
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - Use demo credentials: `fraud.analyst` / `demo123`

### Docker Deployment

1. **Build and start all services**
   ```bash
   docker-compose up --build -d
   ```

2. **Access services**
   - Application: [http://localhost:3000](http://localhost:3000)
   - Prometheus: [http://localhost:9090](http://localhost:9090)
   - Grafana: [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
fraudguard-360-telecom-fraud/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   ├── landing/           # Landing page
│   │   └── search/            # Search interface
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── cards/             # Dashboard cards
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # Authentication logic
│   │   ├── database.ts        # Database connection
│   │   ├── fraud-detection.ts # Fraud detection algorithms
│   │   └── constants.ts       # Application constants
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema and migrations
├── __tests__/                 # Test files
├── docs/                      # Documentation
├── k8s/                       # Kubernetes manifests
├── monitoring/                # Monitoring configuration
└── docker-compose.yml         # Docker services
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fraudguard_db"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Security
ENCRYPTION_KEY="your-32-character-encryption-key"

# Features
ENABLE_REAL_TIME_STREAMING=true
ENABLE_PERFORMANCE_MONITORING=true
DEMO_MODE=true
```

### Fraud Detection Configuration

The system includes configurable fraud detection rules in `src/lib/constants.ts`:

- **Risk Level Thresholds**: Low (0-29), Medium (30-59), High (60-79), Critical (80-100)
- **Detection Rules**: International calls, device switching, high-value recharges
- **Behavioral Analysis**: Call patterns, location analysis, device usage

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run quality checks
npm run quality
```

## 📊 Monitoring & Observability

### Metrics Collection
- **Application Metrics**: Response times, error rates, throughput
- **Business Metrics**: Fraud detection rates, false positives
- **System Metrics**: CPU, memory, disk usage

### Dashboards
- **Grafana**: System performance and business metrics
- **Prometheus**: Time-series data collection
- **Application**: Built-in real-time monitoring

## 🔒 Security Features

- **Authentication**: JWT-based with secure session management
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive data sanitization
- **Rate Limiting**: API protection against abuse
- **Audit Logging**: Complete activity tracking
- **Data Encryption**: Sensitive data encryption at rest
- **Security Headers**: Helmet.js security middleware

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n fraudguard
```

### Docker Production

```bash
# Build production image
docker build -t fraudguard-360:latest .

# Run with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Performance

- **Response Time**: < 200ms for API endpoints
- **Throughput**: 1000+ requests per second
- **Scalability**: Horizontal scaling with load balancing
- **Caching**: Redis-based caching for improved performance
- **Database**: Optimized queries with proper indexing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review the [API documentation](docs/api/)

## 🎓 Academic Context

This project was developed as a **Proof of Concept (PFA)** for academic purposes, demonstrating:
- Advanced fraud detection algorithms
- Real-time data processing
- Modern web application architecture
- Comprehensive security implementation
- Professional software development practices

---

<div align="center">
  <p>Built with ❤️ for telecom fraud prevention</p>
  <p>FraudGuard 360° - Protecting telecommunications networks worldwide</p>
</div>