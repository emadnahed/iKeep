# iKeep

iKeep is a full-stack MERN application that allows users to create, read, update, and delete notes. Designed for **horizontal scalability** and **high concurrent load handling**.

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────────┐
│   Browser   │────▶│  Nginx LB   │────▶│  Backend (N replicas)   │
│             │     │  :8080      │     │  :5000                  │
└─────────────┘     └─────────────┘     └───────────┬─────────────┘
                           │                        │
                           ▼                        ▼
                    ┌─────────────┐          ┌─────────────┐
                    │  Frontend   │          │   MongoDB   │
                    │  :80        │          │   :27017    │
                    └─────────────┘          └─────────────┘
                                                    │
                                             ┌──────┴──────┐
                                             │    Redis    │
                                             │    :6379    │
                                             └─────────────┘
```

## Project Structure

-   `src/`: React frontend application
-   `backend/`: Node.js Express API
-   `nginx.conf`: Load balancer configuration
-   `docker-compose.yml`: Container orchestration

## 🚀 Running the Application

### Quick Start (3 backend replicas)

```bash
docker-compose up -d --scale backend=3
```

The application will be available at `http://localhost:8080`.

### Scale Up/Down

```bash
# Scale to 5 backend replicas
docker-compose up -d --scale backend=5

# Scale back to 1
docker-compose up -d --scale backend=1
```

### Check Service Status

```bash
docker-compose ps
```

## 🧪 Testing

### Verification Script

```bash
./verify.sh
```

Creates a test user, logs in, and performs CRUD operations on notes.

### Load Testing

```bash
./loadtest.sh
```

Runs load tests including:
- Distribution check across backends
- Light/Medium/Heavy load tests (100-1000 requests)
- Rate limit verification

For better results, install `hey`: `brew install hey`

## 🔧 Scalability Features

| Feature | Description |
|---------|-------------|
| **Load Balancing** | Nginx with least_conn algorithm |
| **Rate Limiting** | 100 requests/second per IP |
| **Connection Pooling** | MongoDB (50 max), Redis-backed state |
| **Health Checks** | All services with auto-restart |
| **Graceful Shutdown** | Clean connection draining |
| **Stateless Backend** | JWT authentication, horizontal scaling ready |

## 📊 Health Endpoints

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed status with DB/Redis info

## 🛑 Stopping the Application

```bash
docker-compose down

# Remove volumes (clears data)
docker-compose down -v
```