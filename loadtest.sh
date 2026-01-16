#!/bin/bash

# iKeep Load Testing Script
# Tests the application under various load conditions

BASE_URL="${BASE_URL:-http://localhost:8080}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "           iKeep Load Testing Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Target: $BASE_URL"
echo ""

# Check if hey is installed
if ! command -v hey &> /dev/null; then
    echo -e "${YELLOW}⚠️  'hey' not found. Install with: brew install hey${NC}"
    echo ""
    echo "Falling back to curl-based tests..."
    USE_CURL=true
else
    USE_CURL=false
fi

# Function to check service health
check_health() {
    echo "📊 Checking service health..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ Service is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Service is not responding (HTTP $response)${NC}"
        return 1
    fi
}

# Function to check load distribution
check_distribution() {
    echo ""
    echo "🔄 Checking load distribution across backends..."
    echo "   Sending 20 requests to /api/health..."
    
    hostnames=""
    for i in {1..20}; do
        hostname=$(curl -s "$BASE_URL/api/health" | grep -o '"hostname":"[^"]*"' | cut -d'"' -f4)
        hostnames="$hostnames$hostname\n"
    done
    
    echo "   Distribution:"
    echo -e "$hostnames" | sort | uniq -c | sort -rn | while read count name; do
        if [ -n "$name" ]; then
            echo "     $name: $count requests"
        fi
    done
}

# Load test with hey
run_hey_test() {
    local requests=$1
    local concurrency=$2
    local endpoint=$3
    local description=$4
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📈 $description"
    echo "   Requests: $requests | Concurrency: $concurrency"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    hey -n $requests -c $concurrency "$BASE_URL$endpoint" 2>&1 | grep -E "Requests/sec|Average|Slowest|Fastest|Total:|Status code"
}

# Load test with curl (fallback)
run_curl_test() {
    local requests=$1
    local concurrency=$2
    local endpoint=$3
    local description=$4
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📈 $description (curl-based)"
    echo "   Requests: $requests"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    success=0
    failed=0
    start_time=$(date +%s.%N)
    
    for i in $(seq 1 $requests); do
        status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
        if [ "$status" == "200" ]; then
            ((success++))
        else
            ((failed++))
        fi
    done
    
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc)
    rps=$(echo "scale=2; $requests / $duration" | bc)
    
    echo "   Duration: ${duration}s"
    echo "   Requests/sec: $rps"
    echo -e "   ${GREEN}Success: $success${NC} | ${RED}Failed: $failed${NC}"
}

# Rate limit test
test_rate_limit() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚦 Testing Rate Limiting"
    echo "   Sending 150 rapid requests (limit: 100/min)..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    codes_200=0
    codes_429=0
    codes_other=0
    
    for i in {1..150}; do
        status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
        case $status in
            200) ((codes_200++)) ;;
            429) ((codes_429++)) ;;
            *) ((codes_other++)) ;;
        esac
    done
    
    echo -e "   ${GREEN}200 OK: $codes_200${NC}"
    echo -e "   ${YELLOW}429 Rate Limited: $codes_429${NC}"
    if [ $codes_other -gt 0 ]; then
        echo -e "   ${RED}Other: $codes_other${NC}"
    fi
    
    if [ $codes_429 -gt 0 ]; then
        echo -e "   ${GREEN}✅ Rate limiting is working!${NC}"
    else
        echo -e "   ${YELLOW}⚠️  No rate limiting detected (may need more requests)${NC}"
    fi
}

# Main execution
main() {
    echo ""
    
    # Check health first
    if ! check_health; then
        echo ""
        echo -e "${RED}❌ Cannot proceed - service is not available${NC}"
        echo "   Start the service with: docker-compose up -d --scale backend=3"
        exit 1
    fi
    
    # Check distribution
    check_distribution
    
    # Run load tests
    if [ "$USE_CURL" = true ]; then
        run_curl_test 100 1 "/api/health" "Light Load Test (100 requests)"
    else
        run_hey_test 100 10 "/api/health" "Light Load Test (100 requests, 10 concurrent)"
        run_hey_test 500 50 "/api/health" "Medium Load Test (500 requests, 50 concurrent)"
        run_hey_test 1000 100 "/api/health" "Heavy Load Test (1000 requests, 100 concurrent)"
    fi
    
    # Test rate limiting
    test_rate_limit
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "           Load Testing Complete"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

main "$@"
