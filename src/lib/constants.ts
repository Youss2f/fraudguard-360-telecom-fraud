// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  
  // Subscribers
  SUBSCRIBERS: {
    BASE: '/api/subscribers',
    BY_ID: (id: string) => `/api/subscribers/${id}`,
  },
  
  // Analytics
  ANALYTICS: {
    REAL_TIME: '/api/analytics/real-time',
  },
  
  // CDR Processing
  CDR: {
    PROCESS: '/api/cdr/process',
  },
  
  // Fraud Detection
  FRAUD: {
    DETECT: (id: string) => `/api/fraud/detect/${id}`,
  },
  
  // Monitoring
  MONITORING: {
    PERFORMANCE: '/api/monitoring/performance',
  },
  
  // Streaming
  STREAMING: {
    EVENTS: '/api/streaming/events',
    SSE: '/api/streaming/sse',
  },
  
  // Health
  HEALTH: '/api/health',
} as const

// Application Configuration
export const APP_CONFIG = {
  NAME: 'FraudGuard 360°',
  VERSION: '1.0.0',
  DESCRIPTION: 'Advanced Telecom Fraud Detection System',
  
  // Demo Configuration
  DEMO: {
    ENABLED: process.env.NODE_ENV !== 'production',
    CREDENTIALS: {
      USERNAME: 'fraud.analyst',
      PASSWORD: 'demo123',
    },
  },
  
  // Security
  SECURITY: {
    JWT_EXPIRES_IN: '24h',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
  
  // Performance
  PERFORMANCE: {
    CACHE_TTL: {
      SUBSCRIBER_DATA: 300, // 5 minutes
      ANALYTICS_DATA: 60,   // 1 minute
      HEALTH_CHECK: 30,     // 30 seconds
    },
  },
  
  // UI Configuration
  UI: {
    THEME: {
      DEFAULT: 'system',
      STORAGE_KEY: 'fraudguard-theme',
    },
    
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 20,
      MAX_PAGE_SIZE: 100,
    },
    
    CHARTS: {
      DEFAULT_COLORS: [
        '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
        '#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#0000ff'
      ],
    },
  },
} as const

// Fraud Detection Configuration
export const FRAUD_CONFIG = {
  RISK_LEVELS: {
    LOW: { threshold: 0, color: '#10b981', label: 'Low Risk' },
    MEDIUM: { threshold: 30, color: '#f59e0b', label: 'Medium Risk' },
    HIGH: { threshold: 60, color: '#ef4444', label: 'High Risk' },
    CRITICAL: { threshold: 80, color: '#dc2626', label: 'Critical Risk' },
  },
  
  DETECTION_RULES: {
    INTERNATIONAL_CALLS: {
      THRESHOLD: 10,
      WEIGHT: 15,
    },
    DEVICE_SWITCHING: {
      THRESHOLD: 3,
      WEIGHT: 20,
    },
    HIGH_VALUE_RECHARGES: {
      THRESHOLD: 5,
      WEIGHT: 25,
    },
    SUSPICIOUS_DEALER: {
      WEIGHT: 30,
    },
  },
} as const

// Database Configuration
export const DATABASE_CONFIG = {
  CONNECTION_POOL: {
    MIN: 2,
    MAX: 10,
  },
  
  QUERY_TIMEOUT: 30000, // 30 seconds
  
  RETRY_ATTEMPTS: 3,
} as const

// Logging Configuration
export const LOGGING_CONFIG = {
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
  },
  
  FORMATS: {
    JSON: 'json',
    SIMPLE: 'simple',
  },
} as const

// Export all constants as a single object for easy access
export const CONSTANTS = {
  API_ENDPOINTS,
  APP_CONFIG,
  FRAUD_CONFIG,
  DATABASE_CONFIG,
  LOGGING_CONFIG,
} as const
