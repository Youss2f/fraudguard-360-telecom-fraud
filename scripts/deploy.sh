#!/bin/bash

# FraudGuard 360° Deployment Script
# This script handles deployment to different environments

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_REGISTRY="ghcr.io"
IMAGE_NAME="fraudguard"
NAMESPACE="fraudguard"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
FraudGuard 360° Deployment Script

Usage: $0 [OPTIONS] ENVIRONMENT

ENVIRONMENTS:
    local       Deploy using Docker Compose locally
    staging     Deploy to staging Kubernetes cluster
    production  Deploy to production Kubernetes cluster

OPTIONS:
    -h, --help              Show this help message
    -v, --version VERSION   Specify image version (default: latest)
    -n, --namespace NS      Specify Kubernetes namespace (default: fraudguard)
    -r, --registry REG      Specify Docker registry (default: ghcr.io)
    --skip-build           Skip Docker image build
    --skip-tests           Skip running tests
    --dry-run              Show what would be deployed without executing

EXAMPLES:
    $0 local                    # Deploy locally with Docker Compose
    $0 staging -v v1.2.3        # Deploy version v1.2.3 to staging
    $0 production --dry-run     # Show production deployment plan
    $0 staging --skip-build     # Deploy to staging without rebuilding image

EOF
}

# Parse command line arguments
ENVIRONMENT=""
VERSION="latest"
SKIP_BUILD=false
SKIP_TESTS=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--registry)
            DOCKER_REGISTRY="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        local|staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
if [[ -z "$ENVIRONMENT" ]]; then
    log_error "Environment is required"
    show_help
    exit 1
fi

# Set full image name
FULL_IMAGE_NAME="${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}"

log_info "Starting deployment to $ENVIRONMENT environment"
log_info "Image: $FULL_IMAGE_NAME"
log_info "Namespace: $NAMESPACE"

# Pre-deployment checks
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    case $ENVIRONMENT in
        local)
            if ! command -v docker &> /dev/null; then
                log_error "Docker is not installed"
                exit 1
            fi
            if ! command -v docker-compose &> /dev/null; then
                log_error "Docker Compose is not installed"
                exit 1
            fi
            ;;
        staging|production)
            if ! command -v kubectl &> /dev/null; then
                log_error "kubectl is not installed"
                exit 1
            fi
            if ! kubectl cluster-info &> /dev/null; then
                log_error "Cannot connect to Kubernetes cluster"
                exit 1
            fi
            ;;
    esac
    
    log_success "Prerequisites check passed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_warning "Skipping tests"
        return
    fi
    
    log_info "Running tests..."
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would run: npm test"
        return
    fi
    
    npm test
    log_success "Tests passed"
}

# Build Docker image
build_image() {
    if [[ "$SKIP_BUILD" == "true" ]]; then
        log_warning "Skipping Docker image build"
        return
    fi
    
    log_info "Building Docker image: $FULL_IMAGE_NAME"
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would run: docker build -t $FULL_IMAGE_NAME ."
        return
    fi
    
    docker build -t "$FULL_IMAGE_NAME" .
    log_success "Docker image built successfully"
}

# Deploy locally with Docker Compose
deploy_local() {
    log_info "Deploying locally with Docker Compose..."
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would run: docker-compose up -d"
        return
    fi
    
    # Update image version in docker-compose.yml if needed
    export FRAUDGUARD_IMAGE="$FULL_IMAGE_NAME"
    
    docker-compose down --remove-orphans
    docker-compose up -d
    
    log_success "Local deployment completed"
    log_info "Application available at: http://localhost:3000"
    log_info "Grafana dashboard: http://localhost:3001"
    log_info "Prometheus: http://localhost:9090"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    local env_suffix=""
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        env_suffix="-staging"
        NAMESPACE="fraudguard-staging"
    fi
    
    log_info "Deploying to Kubernetes ($ENVIRONMENT)..."
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would apply Kubernetes manifests to namespace: $NAMESPACE"
        kubectl apply --dry-run=client -f k8s/
        return
    fi
    
    # Create namespace if it doesn't exist
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply configurations
    kubectl apply -f k8s/configmap.yaml -n "$NAMESPACE"
    kubectl apply -f k8s/secrets.yaml -n "$NAMESPACE"
    
    # Update deployment image
    kubectl set image deployment/fraudguard-app fraudguard-app="$FULL_IMAGE_NAME" -n "$NAMESPACE"
    
    # Apply all manifests
    kubectl apply -f k8s/ -n "$NAMESPACE"
    
    # Wait for rollout
    kubectl rollout status deployment/fraudguard-app -n "$NAMESPACE" --timeout=300s
    
    log_success "Kubernetes deployment completed"
    
    # Get service information
    kubectl get services -n "$NAMESPACE"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_info "Production deployment completed successfully"
        log_info "Don't forget to update DNS records if needed"
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    local health_url=""
    case $ENVIRONMENT in
        local)
            health_url="http://localhost:3000/api/health"
            ;;
        staging|production)
            # Get the service URL from Kubernetes
            local service_ip=$(kubectl get service fraudguard-service -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
            if [[ -n "$service_ip" ]]; then
                health_url="http://$service_ip/api/health"
            else
                log_warning "Could not determine service URL for health check"
                return
            fi
            ;;
    esac
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would check health at: $health_url"
        return
    fi
    
    if [[ -n "$health_url" ]]; then
        for i in {1..10}; do
            if curl -f "$health_url" &> /dev/null; then
                log_success "Health check passed"
                return
            fi
            log_info "Health check attempt $i/10 failed, retrying in 10 seconds..."
            sleep 10
        done
        log_warning "Health check failed after 10 attempts"
    fi
}

# Main deployment flow
main() {
    check_prerequisites
    run_tests
    build_image
    
    case $ENVIRONMENT in
        local)
            deploy_local
            ;;
        staging|production)
            deploy_kubernetes
            ;;
    esac
    
    health_check
    
    log_success "Deployment to $ENVIRONMENT completed successfully!"
}

# Run main function
main
