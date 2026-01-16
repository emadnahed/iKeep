# iKeep Horizontal Scaling Guide

This document explains the horizontal scaling architecture of iKeep and provides guidance for scaling the application to handle high concurrent requests globally.

## Architecture Overview

```
                                    ┌─────────────────┐
                                    │   Clients       │
                                    │  (Worldwide)    │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Nginx Load     │
                                    │  Balancer       │
                                    │  (Port 8080)    │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
           ┌────────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
           │   Backend #1    │     │   Backend #2    │     │   Backend #N    │
           │   (Port 5000)   │     │   (Port 5000)   │     │   (Port 5000)   │
           └────────┬────────┘     └────────┬────────┘     └────────┬────────┘
                    │                        │                        │
                    └────────────────────────┼────────────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
           ┌────────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
           │    MongoDB      │     │     Redis       │     │   Frontend      │
           │  (Port 27017)   │     │   (Port 6379)   │     │   (Port 3000)   │
           └─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Current Scalability Features

### 1. Stateless Backend Design

The backend is designed to be stateless, enabling horizontal scaling:

- **JWT-based Authentication**: No server-side sessions. Authentication tokens are self-contained.
- **No In-Memory State**: All persistent data is stored in MongoDB.
- **Request Independence**: Each request can be handled by any backend instance.

**Location**: `backend/routes/auth.js`, `backend/middleware/fetchuser.js`

### 2. Docker Compose Replicas

The application supports multiple backend replicas out of the box:

```yaml
# docker-compose.yml
backend:
  deploy:
    replicas: 3  # Default: 3 replicas
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
```

**Scaling command**:
```bash
# Scale to 5 backend instances
docker-compose up -d --scale backend=5
```

### 3. Nginx Load Balancer

Nginx distributes traffic across backend instances:

```nginx
# nginx.conf
upstream backend_servers {
    least_conn;  # Routes to server with fewest connections
    server backend:5000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

**Features**:
- `least_conn` algorithm for optimal load distribution
- Connection keepalive for reduced latency
- Automatic failover (3 failures = 30s timeout)
- Retry on upstream failures

### 4. Rate Limiting

Two-tier rate limiting prevents abuse:

**Nginx Layer** (`nginx.conf`):
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;
```

**Application Layer** (`backend/middleware/rateLimit.js`):
- Redis-backed distributed rate limiting
- Automatic fallback to in-memory if Redis unavailable
- 100 requests per minute per IP

### 5. MongoDB Connection Pooling

Optimized database connections for high concurrency:

```javascript
// backend/db.js
const connectionOptions = {
    maxPoolSize: 50,    // Maximum connections
    minPoolSize: 10,    // Minimum maintained connections
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    retryReads: true,
};
```

### 6. Response Compression

Gzip compression reduces bandwidth for global users:

```nginx
# nginx.conf
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript;
```

### 7. Health Checks

All services have health checks for orchestration:

| Service | Endpoint | Interval |
|---------|----------|----------|
| Backend | `GET /api/health` | 30s |
| Backend (detailed) | `GET /api/health/detailed` | On-demand |
| MongoDB | `mongosh --eval "db.adminCommand('ping')"` | 30s |
| Redis | `redis-cli ping` | 10s |
| Frontend | HTTP 200 on port 80 | 30s |

### 8. Graceful Shutdown

Backend handles shutdown signals properly:

```javascript
// backend/index.js
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

This ensures:
- No dropped requests during deployments
- Clean database connection closure
- Redis connection cleanup

## Scaling for Global Traffic

### Horizontal Scaling Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Stateless backend | ✅ Ready | JWT-based auth |
| Load balancer | ✅ Ready | Nginx with least_conn |
| Database pooling | ✅ Ready | 50 max connections |
| Rate limiting | ✅ Ready | Redis + fallback |
| Health checks | ✅ Ready | All services |
| Compression | ✅ Ready | Gzip enabled |
| Graceful shutdown | ✅ Ready | SIGTERM handling |

### Scaling Configurations

#### Low Traffic (< 1K concurrent users)
```bash
docker-compose up -d --scale backend=2
```

#### Medium Traffic (1K - 10K concurrent users)
```bash
docker-compose up -d --scale backend=5
```

#### High Traffic (10K+ concurrent users)
```bash
docker-compose up -d --scale backend=10
```

### Performance Benchmarks

Single backend instance (local testing):
```
Concurrency Level:      100
Requests per second:    438.36 [#/sec]
Time per request:       2.281 [ms]
Failed requests:        0
```

## Production Recommendations

### 1. MongoDB High Availability

For production, use MongoDB Replica Set:

```yaml
# docker-compose.prod.yml
mongo-primary:
  image: mongo:latest
  command: mongod --replSet rs0

mongo-secondary-1:
  image: mongo:latest
  command: mongod --replSet rs0

mongo-secondary-2:
  image: mongo:latest
  command: mongod --replSet rs0
```

### 2. Redis Cluster

For distributed rate limiting across regions:

```yaml
redis:
  image: redis:alpine
  command: redis-server --cluster-enabled yes
```

### 3. Database Indexes

Ensure indexes are created for query performance:

```javascript
// backend/models/Note.js
NotesSchema.index({ user: 1 });           // User lookups
NotesSchema.index({ user: 1, date: -1 }); // Recent notes
```

### 4. CDN for Frontend

Use a CDN (CloudFlare, AWS CloudFront) for:
- Static asset caching
- Global edge distribution
- DDoS protection

### 5. Multi-Region Deployment

For global users, deploy in multiple regions:

```
Region: US-East     →  Backend Cluster + MongoDB Primary
Region: EU-West     →  Backend Cluster + MongoDB Secondary
Region: Asia-Pacific →  Backend Cluster + MongoDB Secondary
```

## Monitoring & Observability

### Health Endpoints

```bash
# Basic health (for load balancers)
curl http://localhost:5000/api/health

# Detailed health (for monitoring)
curl http://localhost:5000/api/health/detailed
```

**Response**:
```json
{
  "status": "healthy",
  "hostname": "backend-1",
  "uptime": 3600,
  "memory": {
    "used": "45MB",
    "total": "512MB"
  },
  "services": {
    "database": {
      "status": "connected",
      "host": "mongo",
      "name": "ikeeper"
    },
    "rateLimit": {
      "type": "redis",
      "connected": true
    }
  }
}
```

### Nginx Access Logs

Logs include upstream server info for debugging:
```
192.168.1.1 - - [timestamp] "GET /api/notes" 200 upstream: backend:5000 response_time: 0.012
```

## Troubleshooting

### Backend Not Scaling

1. Check Docker resources:
   ```bash
   docker stats
   ```

2. Verify Nginx can reach backends:
   ```bash
   docker-compose exec nginx-lb wget -qO- http://backend:5000/api/health
   ```

### High Latency

1. Check MongoDB connection pool:
   ```bash
   curl http://localhost:5000/api/health/detailed | jq '.services.database'
   ```

2. Verify Redis connectivity:
   ```bash
   docker-compose exec redis redis-cli ping
   ```

### Rate Limiting Issues

If rate limiter falls back to memory:
```bash
# Check Redis status
docker-compose exec redis redis-cli info | grep connected_clients
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Backend port |
| `MONGO_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Secret for JWT signing |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL |
| `NODE_ENV` | No | development | Environment mode |

## Quick Commands

```bash
# Start with 3 replicas (default)
docker-compose up -d

# Scale to 5 backends
docker-compose up -d --scale backend=5

# View logs from all backends
docker-compose logs -f backend

# Check load distribution
docker-compose exec nginx-lb cat /var/log/nginx/access.log | grep upstream

# Run load test
ab -n 1000 -c 100 http://localhost:8080/api/health
```

## Related Files

- `docker-compose.yml` - Service orchestration
- `nginx.conf` - Load balancer configuration
- `backend/db.js` - Database connection management
- `backend/middleware/rateLimit.js` - Rate limiting logic
- `backend/index.js` - Graceful shutdown handling
