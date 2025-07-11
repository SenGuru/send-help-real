#!/bin/bash

echo "1. Testing admin login..."

# Login as admin
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yourbusiness.com", "password": "admin123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token using simple grep and sed (since jq might not be available)
TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "No token found in response"
  exit 1
fi

echo "Token extracted: $TOKEN"

echo -e "\n2. Testing get all users..."

# Get all users
USERS_RESPONSE=$(curl -s -X GET "http://localhost:3001/api/admin/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Users response: $USERS_RESPONSE"

# Extract first user ID (looking for numeric id)
USER_ID=$(echo "$USERS_RESPONSE" | grep -o '"id":[0-9]\+' | head -1 | cut -d: -f2)

if [ -z "$USER_ID" ]; then
  echo "No user ID found in response"
  exit 1
fi

echo "First user ID: $USER_ID"

echo -e "\n3. Testing get user details..."

# Get user details
DETAILS_RESPONSE=$(curl -s -X GET "http://localhost:3001/api/admin/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "User details response: $DETAILS_RESPONSE"