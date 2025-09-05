# 🔌 **FraudGuard 360° API Documentation**

## 📋 **Overview**

The FraudGuard 360° platform provides a comprehensive REST API with enterprise-grade features including authentication, real-time fraud detection, CDR processing, streaming analytics, and comprehensive monitoring capabilities.

**Base URL**: `http://localhost:3000/api` (Development)  
**Production URL**: `https://your-domain.com/api`

**API Version**: 1.0.0  
**Authentication**: JWT Bearer Token  
**Rate Limiting**: 100 requests per 15 minutes (configurable)

---

## 🔐 **Authentication**

### **JWT Token Authentication**

```bash
# Login to get JWT token
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}

# Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "username": "admin",
      "role": "ADMIN"
    }
  }
}
```

### **Using JWT Token**

```bash
# Include token in Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **API Key Authentication**

```bash
# Alternative authentication method
X-API-Key: your-api-key-here
```

---

## 🚨 **Fraud Detection**

### **GET** `/api/fraud/detect/{id}`

Perform real-time fraud detection analysis for a subscriber.

**Parameters:**

- `id` (path): Subscriber identifier (MSISDN or IMSI)
- `refresh` (query, optional): Force fresh analysis (true/false)

**Example Request:**

```bash
GET /api/fraud/detect/+1555123456?refresh=true
Authorization: Bearer your-jwt-token
```

**Response:**

```json
{
  "success": true,
  "data": {
    "subscriber_id": "+1555123456",
    "fraud_analysis": {
      "risk_score": 85,
      "risk_level": "HIGH",
      "confidence": 0.92,
      "analysis_timestamp": "2024-01-15T10:30:00Z",
      "processing_time_ms": 1250
    },
    "alerts": [
      {
        "type": "VELOCITY_FRAUD",
        "severity": "HIGH",
        "title": "Unusual Call Volume Detected",
        "description": "Subscriber has made an unusually high number of calls",
        "risk_score": 85,
        "confidence": 0.92,
        "evidence": {
          "callsLastHour": 75,
          "normalAverage": 12,
          "timeWindow": "1 hour"
        }
      }
    ],
    "recommendations": [
      "IMMEDIATE ACTION: Suspend account pending investigation",
      "Contact subscriber to verify recent activity"
    ]
  }
}
```

---

## 📁 **CDR Processing**

### **GET** `/api/cdr/process`

Process CDR (Call Detail Record) files or generate sample data.

**Parameters:**

- `action` (query): "process" or "generate_sample"
- `format` (query): "csv", "xml", or "json" (for sample generation)
- `records` (query): Number of records to generate (default: 100)

**Example Requests:**

```bash
# Process all CDR files
GET /api/cdr/process?action=process
Authorization: Bearer your-jwt-token

# Generate sample CDR file
GET /api/cdr/process?action=generate_sample&format=csv&records=1000
Authorization: Bearer your-jwt-token
```

**Response (Process):**

```json
{
  "success": true,
  "data": {
    "action": "process",
    "message": "CDR processing completed",
    "summary": {
      "files_processed": 3,
      "total_records": 15000,
      "successful_records": 14850,
      "error_records": 150,
      "success_rate": "99.00%"
    },
    "file_results": [
      {
        "file_name": "cdr_20240115.csv",
        "format": "csv",
        "total_records": 5000,
        "successful_records": 4950,
        "error_records": 50,
        "processing_time_ms": 2500
      }
    ]
  }
}
```

---

## 📡 **Real-Time Streaming**

### **GET** `/api/streaming/events`

Control and monitor real-time event streaming.

**Parameters:**

- `action` (query): "status", "start", "stop", or "latest"
- `type` (query): Event type filter for latest events
- `limit` (query): Number of events to return (default: 50)

**Example Requests:**

```bash
# Get streaming status
GET /api/streaming/events?action=status
Authorization: Bearer your-jwt-token

# Start streaming
GET /api/streaming/events?action=start
Authorization: Bearer your-jwt-token

# Get latest fraud alerts
GET /api/streaming/events?action=latest&type=FRAUD_ALERT&limit=10
Authorization: Bearer your-jwt-token
```

### **GET** `/api/streaming/sse`

Server-Sent Events endpoint for real-time updates.

**Parameters:**

- `types` (query): Comma-separated event types to subscribe to
- `client_id` (query): Unique client identifier

**Example:**

```javascript
const eventSource = new EventSource("/api/streaming/sse?types=FRAUD_ALERT,NEW_CALL")

eventSource.onmessage = function (event) {
  const data = JSON.parse(event.data)
  console.log("Real-time event:", data)
}
```

---

## 📊 **Monitoring & Performance**

### **GET** `/api/monitoring/performance`

Get system performance metrics and health information.

**Parameters:**

- `health` (query): Include health check data (true/false)
- `details` (query): Include detailed metrics (true/false)

**Response:**

```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "monitoring_enabled": true,
    "basic_metrics": {
      "uptime": 86400,
      "memory": {
        "used": 512,
        "total": 1024,
        "usage_percent": 50
      },
      "node_version": "v18.17.0",
      "platform": "linux"
    },
    "health": {
      "status": "healthy",
      "issues": [],
      "summary": {
        "apiCalls": {},
        "dbQueries": {},
        "memoryUsage": {
          "current": 50,
          "average": 45,
          "max": 75
        }
      }
    }
  }
}
```

### **GET** `/api/health`

Comprehensive system health check.

**Response:**

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "overall_status": "healthy",
  "services": {
    "application": {
      "status": "healthy",
      "uptime": 86400,
      "memory_usage": 50,
      "node_version": "v18.17.0"
    },
    "database": {
      "status": "healthy",
      "details": {
        "connected": true,
        "response_time_ms": 15
      }
    },
    "cache": {
      "status": "healthy",
      "details": {
        "redis_connected": true,
        "memory_cache_size": 1024
      }
    }
  },
  "environment": {
    "node_env": "production",
    "enable_real_data": true,
    "enable_cache": true,
    "enable_performance_monitoring": true
  },
  "response_time_ms": 45
}
```

---

## 👤 **Subscriber Data**

### **GET** `/api/subscribers/{id}`

Retrieve comprehensive subscriber information and analytics.

**Parameters:**

- `id` (path): Subscriber identifier (MSISDN or IMSI)
- `include` (query): Comma-separated list of data to include

**Example Request:**

```bash
GET /api/subscribers/+1555123456?include=calls,sms,data,fraud_analysis
Authorization: Bearer your-jwt-token
```

**Response:**

```json
{
  "success": true,
  "data": {
    "subscriber": {
      "id": "sub_123456",
      "msisdn": "+1555123456",
      "imsi": "310150123456789",
      "status": "ACTIVE",
      "risk_score": 85,
      "last_activity": "2024-01-15T10:30:00Z"
    },
    "analytics": {
      "call_patterns": {
        "total_calls": 1250,
        "average_duration": 180,
        "peak_hours": ["09:00", "18:00"]
      },
      "fraud_indicators": {
        "velocity_alerts": 3,
        "location_anomalies": 1,
        "device_changes": 2
      }
    }
  }
}
```

---

## 🔍 **Search & Analytics**

### **POST** `/api/search/subscribers`

Advanced subscriber search with filters.

**Request Body:**

```json
{
  "query": {
    "msisdn": "+1555*",
    "risk_score_min": 70,
    "status": "ACTIVE"
  },
  "filters": {
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-01-15"
    },
    "location": "US"
  },
  "pagination": {
    "page": 1,
    "limit": 50
  },
  "sort": {
    "field": "risk_score",
    "order": "desc"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "sub_123456",
        "msisdn": "+1555123456",
        "risk_score": 85,
        "status": "ACTIVE"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 3,
      "limit": 50
    }
  }
}
```

---

## 📈 **Analytics & Reports**

### **GET** `/api/analytics/dashboard`

Get dashboard analytics data.

**Parameters:**

- `period` (query): Time period (1h, 24h, 7d, 30d)
- `metrics` (query): Comma-separated metrics to include

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_subscribers": 50000,
      "active_alerts": 125,
      "fraud_detection_rate": 0.025,
      "system_health": "healthy"
    },
    "metrics": {
      "fraud_alerts_trend": [
        { "timestamp": "2024-01-15T09:00:00Z", "count": 15 },
        { "timestamp": "2024-01-15T10:00:00Z", "count": 23 }
      ],
      "top_risk_subscribers": [
        { "msisdn": "+1555123456", "risk_score": 95 },
        { "msisdn": "+1555789012", "risk_score": 88 }
      ]
    }
  }
}
```

---

## 🚨 **Error Handling**

### **Error Response Format**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid subscriber ID format",
    "details": {
      "field": "id",
      "expected": "MSISDN or IMSI format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

### **HTTP Status Codes**

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## 📊 **Rate Limiting**

### **Rate Limit Headers**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

### **Rate Limit Response**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 900
  }
}
```

---

## 🔧 **SDK & Integration**

### **JavaScript/TypeScript SDK**

```typescript
import { FraudGuardAPI } from "@fraudguard/sdk"

const api = new FraudGuardAPI({
  baseURL: "https://api.fraudguard.com",
  apiKey: "your-api-key",
})

// Detect fraud
const analysis = await api.fraud.detect("+1555123456")
console.log(analysis.risk_score)

// Stream real-time events
api.streaming.subscribe(["FRAUD_ALERT"], (event) => {
  console.log("New fraud alert:", event)
})
```

### **cURL Examples**

```bash
# Get subscriber data
curl -X GET "https://api.fraudguard.com/api/subscribers/+1555123456" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"

# Detect fraud
curl -X GET "https://api.fraudguard.com/api/fraud/detect/+1555123456" \
  -H "Authorization: Bearer your-jwt-token"
```

---

## 📚 **Related Documentation**

- [Authentication Guide](../security/authentication.md)
- [Rate Limiting](../security/rate-limiting.md)
- [Error Handling](../technical/error-handling.md)
- [SDK Documentation](../integrations/sdk.md)

---

**API Team**: api@fraudguard.com  
**Last Updated**: Current Development Session  
**API Version**: 1.0.0  
**OpenAPI Spec**: Available at `/api/docs`
