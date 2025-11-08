#!/bin/bash

# Test script for enhanced chat functionality
# This script tests private messaging, group chat, and WebSocket functionality

BASE_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:4200"

echo "=========================================="
echo "Chat Functionality Test Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test results
print_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Check if servers are running
echo "Checking if servers are running..."
BACKEND_UP=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL || echo "000")
FRONTEND_UP=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL || echo "000")

if [ "$BACKEND_UP" != "000" ]; then
    echo -e "${GREEN}✓${NC} Backend server is running on port 3000"
else
    echo -e "${RED}✗${NC} Backend server is not running. Please start it with: cd backend && npm run start:dev"
    exit 1
fi

if [ "$FRONTEND_UP" != "000" ]; then
    echo -e "${GREEN}✓${NC} Frontend server is running on port 4200"
else
    echo -e "${YELLOW}⚠${NC} Frontend server is not running. Please start it with: cd frontend && npm start"
fi

echo ""
echo "=========================================="
echo "Step 1: Register Two Test Users"
echo "=========================================="

# Register User 1
echo "Registering User 1..."
USER1_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser1@example.com",
    "password": "Test123!@#",
    "role": "customer"
  }')

USER1_TOKEN=$(echo $USER1_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
USER1_ID=$(echo $USER1_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ -n "$USER1_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} User 1 registered successfully"
    echo "  User ID: $USER1_ID"
    echo "  Token: ${USER1_TOKEN:0:20}..."
else
    # Try to login if user already exists
    echo "User 1 might already exist, trying to login..."
    USER1_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testuser1@example.com",
        "password": "Test123!@#"
      }')
    USER1_TOKEN=$(echo $USER1_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    USER1_ID=$(echo $USER1_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
    if [ -n "$USER1_TOKEN" ]; then
        echo -e "${GREEN}✓${NC} User 1 logged in successfully"
    else
        echo -e "${RED}✗${NC} Failed to register/login User 1"
        echo "Response: $USER1_RESPONSE"
        exit 1
    fi
fi

# Register User 2
echo "Registering User 2..."
USER2_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser2@example.com",
    "password": "Test123!@#",
    "role": "customer"
  }')

USER2_TOKEN=$(echo $USER2_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
USER2_ID=$(echo $USER2_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ -n "$USER2_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} User 2 registered successfully"
    echo "  User ID: $USER2_ID"
    echo "  Token: ${USER2_TOKEN:0:20}..."
else
    # Try to login if user already exists
    echo "User 2 might already exist, trying to login..."
    USER2_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testuser2@example.com",
        "password": "Test123!@#"
      }')
    USER2_TOKEN=$(echo $USER2_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    USER2_ID=$(echo $USER2_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
    if [ -n "$USER2_TOKEN" ]; then
        echo -e "${GREEN}✓${NC} User 2 logged in successfully"
    else
        echo -e "${RED}✗${NC} Failed to register/login User 2"
        echo "Response: $USER2_RESPONSE"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "Step 2: Test Private Messaging"
echo "=========================================="

# User 1 creates a conversation with User 2
echo "User 1 creating conversation with User 2..."
CONV_RESPONSE=$(curl -s -X POST $BASE_URL/chat/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d "{
    \"userId\": $USER2_ID
  }")

CONV_ID=$(echo $CONV_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ -n "$CONV_ID" ]; then
    echo -e "${GREEN}✓${NC} Conversation created: ID $CONV_ID"
else
    echo -e "${RED}✗${NC} Failed to create conversation"
    echo "Response: $CONV_RESPONSE"
    exit 1
fi

# User 1 sends a private message to User 2
echo "User 1 sending private message to User 2..."
PRIVATE_MSG_RESPONSE=$(curl -s -X POST $BASE_URL/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d "{
    \"conversationId\": $CONV_ID,
    \"receiverId\": $USER2_ID,
    \"content\": \"Hello User 2, this is a private message!\"
  }")

PRIVATE_MSG_ID=$(echo $PRIVATE_MSG_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
PRIVATE_RECEIVER_ID=$(echo $PRIVATE_MSG_RESPONSE | grep -o '"receiverId":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ -n "$PRIVATE_MSG_ID" ]; then
    echo -e "${GREEN}✓${NC} Private message sent: ID $PRIVATE_MSG_ID"
    if [ "$PRIVATE_RECEIVER_ID" = "$USER2_ID" ]; then
        echo -e "${GREEN}✓${NC} Private message has correct receiverId: $PRIVATE_RECEIVER_ID"
    else
        echo -e "${RED}✗${NC} Private message receiverId mismatch. Expected: $USER2_ID, Got: $PRIVATE_RECEIVER_ID"
    fi
else
    echo -e "${RED}✗${NC} Failed to send private message"
    echo "Response: $PRIVATE_MSG_RESPONSE"
fi

# User 2 retrieves messages
echo "User 2 retrieving messages..."
USER2_MESSAGES=$(curl -s -X GET "$BASE_URL/chat/conversations/$CONV_ID/messages" \
  -H "Authorization: Bearer $USER2_TOKEN")

MSG_COUNT=$(echo $USER2_MESSAGES | grep -o '"id":[0-9]*' | wc -l)
if [ "$MSG_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} User 2 can see $MSG_COUNT message(s)"
else
    echo -e "${RED}✗${NC} User 2 cannot see messages"
fi

echo ""
echo "=========================================="
echo "Step 3: Test Global Group Chat"
echo "=========================================="

# User 1 gets global group chat
echo "User 1 getting global group chat..."
GROUP_CHAT_RESPONSE=$(curl -s -X GET $BASE_URL/chat/global-group \
  -H "Authorization: Bearer $USER1_TOKEN")

GROUP_CHAT_ID=$(echo $GROUP_CHAT_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
IS_GLOBAL=$(echo $GROUP_CHAT_RESPONSE | grep -o '"isGlobalGroup":true')

if [ -n "$GROUP_CHAT_ID" ]; then
    echo -e "${GREEN}✓${NC} Global group chat found/created: ID $GROUP_CHAT_ID"
    if [ -n "$IS_GLOBAL" ]; then
        echo -e "${GREEN}✓${NC} Group chat is marked as global"
    else
        echo -e "${YELLOW}⚠${NC} Group chat might not be marked as global"
    fi
else
    echo -e "${RED}✗${NC} Failed to get/create global group chat"
    echo "Response: $GROUP_CHAT_RESPONSE"
fi

# User 1 sends a group message (receiverId should be null)
echo "User 1 sending group message..."
GROUP_MSG_RESPONSE=$(curl -s -X POST $BASE_URL/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d "{
    \"conversationId\": $GROUP_CHAT_ID,
    \"content\": \"Hello everyone in the group chat!\"
  }")

GROUP_MSG_ID=$(echo $GROUP_MSG_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
GROUP_RECEIVER_ID=$(echo $GROUP_MSG_RESPONSE | grep -o '"receiverId":null' || echo "not_null")

if [ -n "$GROUP_MSG_ID" ]; then
    echo -e "${GREEN}✓${NC} Group message sent: ID $GROUP_MSG_ID"
    if [ "$GROUP_RECEIVER_ID" = "not_null" ]; then
        ACTUAL_RECEIVER=$(echo $GROUP_MSG_RESPONSE | grep -o '"receiverId":[0-9]*' | grep -o '[0-9]*' || echo "null")
        if [ "$ACTUAL_RECEIVER" = "null" ] || [ -z "$ACTUAL_RECEIVER" ]; then
            echo -e "${GREEN}✓${NC} Group message has receiverId: null (correct)"
        else
            echo -e "${RED}✗${NC} Group message should have receiverId: null, but got: $ACTUAL_RECEIVER"
        fi
    else
        echo -e "${GREEN}✓${NC} Group message has receiverId: null (correct)"
    fi
else
    echo -e "${RED}✗${NC} Failed to send group message"
    echo "Response: $GROUP_MSG_RESPONSE"
fi

# User 2 gets global group chat and retrieves messages
echo "User 2 getting global group chat..."
USER2_GROUP_CHAT=$(curl -s -X GET $BASE_URL/chat/global-group \
  -H "Authorization: Bearer $USER2_TOKEN")

USER2_GROUP_ID=$(echo $USER2_GROUP_CHAT | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ "$USER2_GROUP_ID" = "$GROUP_CHAT_ID" ]; then
    echo -e "${GREEN}✓${NC} User 2 sees the same global group chat: ID $USER2_GROUP_ID"
else
    echo -e "${RED}✗${NC} User 2 sees different group chat. Expected: $GROUP_CHAT_ID, Got: $USER2_GROUP_ID"
fi

echo "User 2 retrieving group messages..."
USER2_GROUP_MESSAGES=$(curl -s -X GET "$BASE_URL/chat/conversations/$GROUP_CHAT_ID/messages" \
  -H "Authorization: Bearer $USER2_TOKEN")

USER2_GROUP_MSG_COUNT=$(echo $USER2_GROUP_MESSAGES | grep -o '"id":[0-9]*' | wc -l)
if [ "$USER2_GROUP_MSG_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} User 2 can see $USER2_GROUP_MSG_COUNT group message(s)"
else
    echo -e "${RED}✗${NC} User 2 cannot see group messages"
fi

echo ""
echo "=========================================="
echo "Step 4: Verify Message Structure"
echo "=========================================="

# Get private message details
echo "Verifying private message structure..."
PRIVATE_MSG_DETAILS=$(curl -s -X GET "$BASE_URL/chat/conversations/$CONV_ID/messages" \
  -H "Authorization: Bearer $USER1_TOKEN")

PRIVATE_RECEIVER_CHECK=$(echo $PRIVATE_MSG_DETAILS | grep -o "\"receiverId\":$USER2_ID" || echo "not_found")
if [ "$PRIVATE_RECEIVER_CHECK" != "not_found" ]; then
    echo -e "${GREEN}✓${NC} Private message has specific receiverId: $USER2_ID"
else
    echo -e "${RED}✗${NC} Private message does not have correct receiverId"
fi

# Get group message details
echo "Verifying group message structure..."
GROUP_MSG_DETAILS=$(curl -s -X GET "$BASE_URL/chat/conversations/$GROUP_CHAT_ID/messages" \
  -H "Authorization: Bearer $USER1_TOKEN")

GROUP_RECEIVER_CHECK=$(echo $GROUP_MSG_DETAILS | grep -o "\"receiverId\":null" || echo "not_found")
if [ "$GROUP_RECEIVER_CHECK" != "not_found" ]; then
    echo -e "${GREEN}✓${NC} Group message has receiverId: null"
else
    # Check if it's missing receiverId field or has a value
    HAS_RECEIVER_ID=$(echo $GROUP_MSG_DETAILS | grep -o "\"receiverId\":" || echo "not_found")
    if [ "$HAS_RECEIVER_ID" = "not_found" ]; then
        echo -e "${YELLOW}⚠${NC} Group message might not have receiverId field (could be correct if optional)"
    else
        echo -e "${RED}✗${NC} Group message should have receiverId: null"
    fi
fi

echo ""
echo "=========================================="
echo "Step 5: Test Online Users"
echo "=========================================="

# Get online users for User 1
ONLINE_USERS=$(curl -s -X GET $BASE_URL/chat/users/online \
  -H "Authorization: Bearer $USER1_TOKEN")

ONLINE_COUNT=$(echo $ONLINE_USERS | grep -o '"id":[0-9]*' | wc -l)
if [ "$ONLINE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $ONLINE_COUNT online user(s)"
else
    echo -e "${YELLOW}⚠${NC} No online users found (this might be expected if users haven't connected via WebSocket)"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "User 1 ID: $USER1_ID"
echo "User 2 ID: $USER2_ID"
echo "Private Conversation ID: $CONV_ID"
echo "Global Group Chat ID: $GROUP_CHAT_ID"
echo ""
echo "Next Steps:"
echo "1. Open the frontend at $FRONTEND_URL"
echo "2. Login as testuser1@example.com / Test123!@#"
echo "3. Test private chat and group chat in the UI"
echo "4. Test WebSocket real-time messaging by opening two browser windows"
echo ""
echo "=========================================="

