# 🚀 **FraudGuard 360° - Deployment Guide**

## 📋 **Overview**

This guide covers all deployment options for FraudGuard 360°, from local development to production Kubernetes clusters. The platform supports multiple deployment strategies to accommodate different environments and requirements.

---

## 🎯 **Deployment Options**

### **📊 Deployment Matrix**

| Environment    | Method             | Use Case               | Complexity |
| -------------- | ------------------ | ---------------------- | ---------- |
| **Local Dev**  | npm/Docker         | Development, Testing   | ⭐         |
| **Demo**       | Docker Compose     | Demonstrations, POCs   | ⭐⭐       |
| **Staging**    | Kubernetes         | Pre-production Testing | ⭐⭐⭐     |
| **Production** | Kubernetes + CI/CD | Live Production        | ⭐⭐⭐⭐   |

---

## 🏠 **Local Development**

### **Option 1: Demo Mode (Quickest)**

```bash
# 1. Clone and setup
git clone <repository-url>
cd fraudguard-360
npm install --legacy-peer-deps

# 2. Run setup wizard
npm run setup
# Choose option 1: Demo Mode

# 3. Start development server
npm run dev

# 4. Access application
# http://localhost:3000
```

### **Option 2: Production Mode (Database)**

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Setup PostgreSQL
createdb fraudguard_dev

# 3. Configure environment
cp .env.example .env.local
# Edit DATABASE_URL in .env.local

# 4. Setup database
npm run db:generate
npm run db:push
npm run db:seed

# 5. Start development
npm run dev
```

### **Environment Configuration**

```bash
# .env.local
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/fraudguard_dev
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=dev-secret-key
ENABLE_REAL_DATA=true
ENABLE_REDIS_CACHE=false
```

---

## 🐳 **Docker Deployment**

### **Single Container (Development)**

```bash
# Build and run
docker build -t fraudguard-360 .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e ENABLE_REAL_DATA=false \
  fraudguard-360
```

### **Docker Compose (Full Stack)**

```bash
# Deploy complete stack
docker-compose up -d

# Access points:
# - Application: http://localhost:3000
# - Grafana: http://localhost:3001 (admin/admin123)
# - Prometheus: http://localhost:9090
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379

# View logs
docker-compose logs -f fraudguard-app

# Stop stack
docker-compose down
```

### **Docker Compose Services**

```yaml
# docker-compose.yml structure
services:
  fraudguard-app: # Main application
  postgres: # Database
  redis: # Cache
  prometheus: # Metrics
  grafana: # Dashboards
  nginx: # Load balancer
```

---

## ☸️ **Kubernetes Deployment**

### **Prerequisites**

```bash
# Required tools
kubectl >= 1.25
helm >= 3.8
docker >= 20.10

# Verify cluster access
kubectl cluster-info
kubectl get nodes
```

### **Quick Kubernetes Deployment**

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# 3. Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# 4. Check deployment
kubectl get pods -n fraudguard
kubectl get services -n fraudguard
```

### **Automated Deployment Script**

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy to staging
./scripts/deploy.sh staging -v v1.2.3

# Deploy to production
./scripts/deploy.sh production -v latest

# Dry run (preview changes)
./scripts/deploy.sh production --dry-run

# Deploy with custom options
./scripts/deploy.sh production \
  --version v1.2.3 \
  --namespace custom-ns \
  --skip-tests
```

### **Kubernetes Configuration**

```yaml
# Production deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fraudguard-app
  namespace: fraudguard
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
        - name: fraudguard-app
          image: ghcr.io/your-org/fraudguard:latest
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

---

## 🔄 **CI/CD Deployment**

### **GitHub Actions Pipeline**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and Push Docker Image
        run: |
          docker build -t ghcr.io/${{ github.repository }}:${{ github.sha }} .
          docker push ghcr.io/${{ github.repository }}:${{ github.sha }}

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/fraudguard-app \
            fraudguard-app=ghcr.io/${{ github.repository }}:${{ github.sha }} \
            -n fraudguard
          kubectl rollout status deployment/fraudguard-app -n fraudguard
```

### **Deployment Environments**

```bash
# Development (automatic on feature branches)
git push origin feature/new-feature

# Staging (automatic on develop branch)
git push origin develop

# Production (automatic on main branch)
git push origin main

# Manual deployment
gh workflow run deploy.yml -f environment=production
```

---

## 🌐 **Cloud Provider Deployment**

### **AWS EKS**

```bash
# 1. Create EKS cluster
eksctl create cluster --name fraudguard-cluster \
  --region us-west-2 \
  --nodes 3 \
  --node-type t3.medium

# 2. Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name fraudguard-cluster

# 3. Deploy application
./scripts/deploy.sh production -v latest
```

### **Azure AKS**

```bash
# 1. Create AKS cluster
az aks create \
  --resource-group fraudguard-rg \
  --name fraudguard-cluster \
  --node-count 3 \
  --node-vm-size Standard_D2s_v3

# 2. Get credentials
az aks get-credentials --resource-group fraudguard-rg --name fraudguard-cluster

# 3. Deploy application
./scripts/deploy.sh production -v latest
```

### **Google GKE**

```bash
# 1. Create GKE cluster
gcloud container clusters create fraudguard-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-medium

# 2. Get credentials
gcloud container clusters get-credentials fraudguard-cluster --zone us-central1-a

# 3. Deploy application
./scripts/deploy.sh production -v latest
```

---

## 📊 **Monitoring Setup**

### **Prometheus & Grafana**

```bash
# Deploy monitoring stack
kubectl apply -f monitoring/prometheus.yaml
kubectl apply -f monitoring/grafana.yaml

# Access Grafana
kubectl port-forward svc/grafana 3001:3000 -n monitoring

# Import dashboards
# - FraudGuard Application Dashboard
# - Infrastructure Monitoring Dashboard
# - Business Metrics Dashboard
```

### **Alerting Configuration**

```yaml
# monitoring/alert-rules.yaml
groups:
  - name: fraudguard.rules
    rules:
      - alert: ApplicationDown
        expr: up{job="fraudguard-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "FraudGuard application is down"
```

---

## 🔒 **Security Configuration**

### **TLS/SSL Setup**

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fraudguard-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
    - hosts:
        - fraudguard.yourdomain.com
      secretName: fraudguard-tls
  rules:
    - host: fraudguard.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: fraudguard-service
                port:
                  number: 80
```

### **Network Policies**

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: fraudguard-network-policy
  namespace: fraudguard
spec:
  podSelector:
    matchLabels:
      app: fraudguard-app
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
```

---

## 🔧 **Configuration Management**

### **Environment-Specific Configs**

```bash
# Development
cp .env.example .env.local
# Edit for development settings

# Staging
cp .env.example .env.staging
# Edit for staging settings

# Production
cp .env.example .env.production
# Edit for production settings
```

### **Kubernetes Secrets**

```bash
# Create secrets from environment file
kubectl create secret generic fraudguard-secrets \
  --from-env-file=.env.production \
  -n fraudguard

# Or create individual secrets
kubectl create secret generic database-secret \
  --from-literal=DATABASE_URL="postgresql://..." \
  -n fraudguard
```

### **ConfigMaps**

```bash
# Create configmap from file
kubectl create configmap fraudguard-config \
  --from-file=config.yaml \
  -n fraudguard

# Or from literals
kubectl create configmap fraudguard-config \
  --from-literal=NODE_ENV=production \
  --from-literal=LOG_LEVEL=info \
  -n fraudguard
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Application Won't Start**

```bash
# Check pod status
kubectl get pods -n fraudguard
kubectl describe pod <pod-name> -n fraudguard

# Check logs
kubectl logs <pod-name> -n fraudguard
kubectl logs -f deployment/fraudguard-app -n fraudguard
```

#### **Database Connection Issues**

```bash
# Test database connectivity
kubectl exec -it <pod-name> -n fraudguard -- \
  psql $DATABASE_URL -c "SELECT 1;"

# Check database pod
kubectl get pods -n fraudguard | grep postgres
kubectl logs <postgres-pod> -n fraudguard
```

#### **Performance Issues**

```bash
# Check resource usage
kubectl top pods -n fraudguard
kubectl top nodes

# Check HPA status
kubectl get hpa -n fraudguard
kubectl describe hpa fraudguard-hpa -n fraudguard
```

### **Health Checks**

```bash
# Application health
curl http://localhost:3000/api/health

# Kubernetes health
kubectl get pods -n fraudguard
kubectl get services -n fraudguard
kubectl get ingress -n fraudguard
```

---

## 📈 **Scaling**

### **Horizontal Pod Autoscaler**

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: fraudguard-hpa
  namespace: fraudguard
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: fraudguard-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### **Manual Scaling**

```bash
# Scale deployment
kubectl scale deployment fraudguard-app --replicas=5 -n fraudguard

# Check scaling status
kubectl get pods -n fraudguard
kubectl get hpa -n fraudguard
```

---

## 📚 **Related Documentation**

- [Architecture Guide](../technical/architecture.md)
- [Security Guide](../security/README.md)
- [Monitoring Guide](./monitoring.md)
- [Performance Guide](./performance.md)

---

**DevOps Team**: devops@fraudguard.com  
**Last Updated**: Current Development Session  
**Deployment Version**: 1.0.0  
**Support**: 24/7 for production deployments
