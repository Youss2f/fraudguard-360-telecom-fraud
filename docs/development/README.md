# 👨‍💻 **FraudGuard 360° - Development Guide**

## 📋 **Overview**

This guide provides comprehensive information for developers working on FraudGuard 360°. It covers development setup, coding standards, testing procedures, and contribution guidelines.

---

## 🚀 **Quick Start for Developers**

### **Prerequisites**

```bash
# Required software
Node.js 18+ (LTS recommended)
npm 9+ or yarn 1.22+
Git 2.30+
PostgreSQL 15+ (for production mode)
Redis 7+ (optional, for caching)
Docker & Docker Compose (for containerized development)
```

### **Development Setup**

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/fraudguard-360.git
cd fraudguard-360

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Run setup wizard
npm run setup
# Choose Demo Mode for quick start

# 5. Start development server
npm run dev
# Open http://localhost:3000
```

---

## 📁 **Project Structure**

### **Directory Organization**

```
fraudguard-360/
├── 📱 app/                    # Next.js App Router
│   ├── api/                   # API routes
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── search/               # Search pages
├── 🧩 components/            # React components
│   ├── ui/                   # Base UI components
│   ├── cards/                # Dashboard cards
│   └── auth/                 # Authentication components
├── 🔧 lib/                   # Utility libraries
│   ├── auth.ts               # Authentication logic
│   ├── database.ts           # Database utilities
│   ├── fraud-detection.ts    # Fraud detection engine
│   └── utils.ts              # General utilities
├── 🎣 hooks/                 # Custom React hooks
├── 🎨 styles/                # Styling files
├── 📊 types/                 # TypeScript type definitions
├── 🧪 __tests__/             # Test files
├── 🐳 docker/                # Docker configurations
├── ☸️ k8s/                   # Kubernetes manifests
├── 📊 monitoring/            # Monitoring configurations
├── 📚 docs/                  # Documentation
└── 🛠️ scripts/              # Utility scripts
```

### **Key Files**

```
📄 Configuration Files
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── next.config.mjs          # Next.js configuration
├── jest.config.js           # Jest testing configuration
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
└── prisma/schema.prisma     # Database schema
```

---

## 🔧 **Development Workflow**

### **Git Workflow**

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: add new fraud detection algorithm"

# 3. Push to your fork
git push origin feature/your-feature-name

# 4. Create Pull Request
# Use GitHub UI to create PR
```

### **Commit Message Convention**

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(fraud-detection): add velocity fraud algorithm
fix(api): resolve authentication token validation
docs(readme): update installation instructions
test(components): add unit tests for dashboard
```

---

## 📜 **Available Scripts**

### **Development Scripts**

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run setup            # Interactive setup wizard
```

### **Database Scripts (Production Mode)**

```bash
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed with sample data
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (development only)
```

### **Code Quality Scripts**

```bash
npm run lint             # Check code quality
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking
npm run quality          # Run all quality checks
```

### **Testing Scripts**

```bash
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ci          # Run tests for CI/CD
npm run test:integration # Run integration tests
npm run test:e2e         # Run end-to-end tests
```

---

## 📋 **Code Standards**

### **TypeScript Guidelines**

```typescript
// Use strict typing
interface FraudAnalysis {
  riskScore: number
  confidence: number
  alerts: FraudAlert[]
}

// Prefer explicit return types
function detectFraud(data: SubscriberData): Promise<FraudAnalysis> {
  // Implementation
}

// Use meaningful names
const calculateRiskScore = (subscriber: Subscriber): number => {
  // Implementation
}
```

### **React Component Guidelines**

```typescript
// Use functional components with TypeScript
interface DashboardProps {
  subscriberId: string;
  onAlertClick?: (alert: FraudAlert) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  subscriberId,
  onAlertClick
}) => {
  // Use hooks appropriately
  const { data, loading, error } = useApi(`/api/subscribers/${subscriberId}`);

  // Handle loading and error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="dashboard">
      {/* Component JSX */}
    </div>
  );
};
```

### **API Route Guidelines**

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { withAuth } from "@/lib/auth"
import { withSecurity } from "@/lib/security"

const requestSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["msisdn", "imsi"]),
})

export async function GET(request: NextRequest) {
  try {
    // Validate input
    const { searchParams } = new URL(request.url)
    const params = requestSchema.parse({
      id: searchParams.get("id"),
      type: searchParams.get("type"),
    })

    // Business logic
    const result = await processRequest(params)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 }
    )
  }
}

// Apply middleware
export const GET_PROTECTED = withAuth(withSecurity(GET))
```

---

## 🧪 **Testing Guidelines**

### **Testing Strategy**

```
┌─────────────────────────────────────────────────────┐
│              Testing Pyramid                       │
├─────────────────────────────────────────────────────┤
│                    E2E Tests                       │
│                 (10% - Slow)                       │
├─────────────────────────────────────────────────────┤
│              Integration Tests                     │
│               (20% - Medium)                       │
├─────────────────────────────────────────────────────┤
│                 Unit Tests                         │
│                (70% - Fast)                        │
└─────────────────────────────────────────────────────┘
```

### **Unit Test Example**

```typescript
// __tests__/lib/fraud-detection.test.ts
import { FraudDetectionEngine } from "@/lib/fraud-detection"
import { mockSubscriberData } from "@/lib/mock-data"

describe("FraudDetectionEngine", () => {
  let fraudEngine: FraudDetectionEngine

  beforeEach(() => {
    fraudEngine = new FraudDetectionEngine()
  })

  describe("velocity fraud detection", () => {
    it("should detect high call volume fraud", async () => {
      const subscriber = mockSubscriberData.highRiskSubscriber
      const result = await fraudEngine.detectVelocityFraud(subscriber)

      expect(result.isDetected).toBe(true)
      expect(result.riskScore).toBeGreaterThan(70)
      expect(result.confidence).toBeGreaterThan(0.8)
    })
  })
})
```

### **Component Test Example**

```typescript
// __tests__/components/subscriber-dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriberDashboard } from '@/components/subscriber-dashboard';

describe('SubscriberDashboard', () => {
  it('renders subscriber information correctly', () => {
    render(<SubscriberDashboard subscriberId="+1234567890" />);

    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('Risk Score')).toBeInTheDocument();
  });
});
```

---

## 🔒 **Security Guidelines**

### **Security Checklist**

- [ ] Validate all inputs with Zod schemas
- [ ] Use parameterized queries (Prisma ORM)
- [ ] Implement proper authentication/authorization
- [ ] Sanitize data before logging
- [ ] Use HTTPS in production
- [ ] Follow OWASP security guidelines
- [ ] Regular dependency updates
- [ ] Security testing for new features

### **Sensitive Data Handling**

```typescript
// ❌ Don't log sensitive data
logger.info("User login", { password: user.password }) // BAD

// ✅ Mask sensitive data
logger.info("User login", {
  userId: user.id,
  username: maskSensitiveData(user.username),
}) // GOOD

// ✅ Use encryption for sensitive fields
const encryptedData = await encrypt(sensitiveData)
```

---

## 📊 **Performance Guidelines**

### **Performance Best Practices**

- Use React.memo for expensive components
- Implement proper caching strategies
- Optimize database queries
- Use lazy loading for heavy components
- Monitor bundle size and performance metrics

### **Database Guidelines**

```typescript
// ✅ Efficient queries
const subscribers = await prisma.subscriber.findMany({
  select: {
    id: true,
    msisdn: true,
    riskScore: true,
    // Only select needed fields
  },
  where: { riskScore: { gte: 70 } },
  take: 100,
})

// ❌ Avoid N+1 queries
// Use include or select with relations
```

---

## 🐛 **Debugging**

### **Development Tools**

```bash
# Enable debug mode
DEBUG=fraudguard:* npm run dev

# Database debugging
npm run db:studio

# Performance profiling
npm run dev -- --profile

# Bundle analysis
npm run build:analyze
```

### **Common Issues**

#### **Database Connection Issues**

```bash
# Check database status
npm run db:status

# Reset database (development only)
npm run db:reset

# Check connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### **Build Issues**

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Type checking
npm run type-check
```

---

## 📚 **Learning Resources**

### **Framework Documentation**

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### **Internal Documentation**

- [Architecture Guide](../technical/architecture.md)
- [API Documentation](../api/README.md)
- [Security Guide](../security/README.md)
- [Testing Guide](./testing.md)

---

## 🤝 **Getting Help**

### **Communication Channels**

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Email**: dev-team@fraudguard.com
- **Slack**: #fraudguard-dev (internal)

### **Code Review Process**

1. Create feature branch
2. Implement changes with tests
3. Run quality checks locally
4. Create pull request
5. Address review feedback
6. Merge after approval

---

**Development Team**: dev-team@fraudguard.com  
**Last Updated**: Current Development Session  
**Development Standards Version**: 1.0.0
