#!/bin/bash

BASE_URL="http://localhost:8080"

echo "Waiting for services to be ready..."
sleep 5

echo "1. Creating User..."
curl -s -X POST $BASE_URL/api/auth/createuser \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User", "email":"test@example.com", "password":"password123"}'
echo -e "\n"

echo "2. Logging In..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com", "password":"password123"}')
echo "Response: $LOGIN_RESPONSE"

# Simple token extraction using grep/sed/cut since we don't have jq
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"authToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Login failed or duplicate user (expected if re-running), trying to login again..."
    # If create failed (e.g. user exists), we might still be able to login.
fi

echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
    echo "Still no token. Exiting."
    exit 1
fi

echo -e "\n3. Adding Note..."
curl -s -X POST $BASE_URL/api/notes/addnote \
     -H "auth-token: $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Scalability Test", "description":"Testing horizontal scaling", "tag":"devops"}'
echo -e "\n"

echo "4. Fetching Notes (Repeated to check load balancing)..."
for i in {1..4}; do
    echo "Request $i:"
    curl -s -X GET $BASE_URL/api/notes/fetchallnotes \
         -H "auth-token: $TOKEN"
    echo -e "\n"
done
