---
description: Repository Information Overview
alwaysApply: true
---

# FraudGuard 360° Information

## Summary
FraudGuard 360° is a prototype telecom fraud detection platform that provides visualization and analysis of call detail records (CDRs). It's designed to help identify suspicious patterns and potential fraud through data visualization and basic analytics.

## Structure
- **src/**: Core application code (components, hooks, lib, types)
- **prisma/**: Database schema and seed scripts
- **public/**: Static assets
- **.next/**: Next.js build output
- **docs/**: Project documentation
- **k8s/**: Kubernetes deployment configurations
- **monitoring/**: Prometheus and alerting configurations
- **scripts/**: Deployment and setup scripts
- **__tests__/**: Test files for components and libraries

## Language & Runtime
**Language**: TypeScript 5.0
**Framework**: Next.js 14.1.0 with React 18.2.0
**Build System**: npm
**Package Manager**: npm
**Node Version**: 18.x (Alpine in Docker)

## Dependencies
**Main Dependencies**:
- Next.js 14.1.0 (React framework)
- React 18.2.0 (UI library)
- Prisma 5.22.0 (ORM for PostgreSQL)
- Tailwind CSS 3.3.3 (Styling)
- Radix UI components (UI primitives)
- bcryptjs, jsonwebtoken (Authentication)
- Winston (Logging)
- Redis (Caching, session management)

**Development Dependencies**:
- Jest 29.7.0 (Testing)
- ESLint, Prettier (Code quality)
- TypeScript 5.x (Type checking)
- Testing Library (React testing)

## Build & Installation
```bash
# Development setup
npm install --legacy-peer-deps
npm run setup  # Interactive setup wizard

# Database setup (Production mode)
npm run db:generate
npm run db:push
npm run db:seed

# Development server
npm run dev

# Production build
npm run build
npm run start
```

## Docker
**Dockerfile**: Multi-stage build for development and production
**Base Image**: node:18-alpine
**Exposed Port**: 3000
**Configuration**: 
- Includes Prisma client generation
- Sets up basic directories for data processing
- Implements health checks
- Uses non-root user for security

**Docker Compose**:
- Main application container
- PostgreSQL 15 (Database)
- Redis 7 (Caching)
- Nginx (Reverse proxy)
- Basic Prometheus/Grafana setup

## Testing
**Framework**: Jest with React Testing Library
**Test Location**: `__tests__/` directory
**Naming Convention**: `*.test.tsx` or `*.test.ts`
**Configuration**: jest.config.js with jsdom environment
**Coverage Goals**: Working toward 70% coverage targets
**Run Command**:
```bash
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## CI/CD
**Workflow**: GitHub Actions
**Stages**:
- Code Quality & Testing
- Security Scanning
- Docker Build & Push
- Deployment (Staging/Production)
- Basic Performance Testing

**Environments**:
- Staging (develop branch)
- Production (main branch)