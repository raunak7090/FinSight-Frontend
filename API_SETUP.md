# FinanceAI - API Setup Guide

## ⚠️ Important: Backend Connection Required

This frontend is now fully integrated with your Firebase + Next.js backend. To use the app, you need to:

1. **Run your backend server** (default: http://localhost:3000)
2. **OR** deploy your backend and set `VITE_API_BASE_URL` environment variable

📖 **See `BACKEND_INTEGRATION.md` for complete setup instructions**

---

## API Response Format

All API responses follow this envelope structure:

```json
{
  "success": true,
  "message": "Human-friendly status message",
  "data": {
    // Actual response data here
  },
  "timestamp": "2025-11-12T19:48:45.532Z"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [],
  "timestamp": "2025-11-12T19:48:45.532Z"
}
```

---

## Authentication Flow

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uid": "nlILNDJtNDQkaOIIl8EYqk7owT73",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "timestamp": "2025-11-12T19:48:45.532Z"
}
```

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "uid": "nlILNDJtNDQkaOIIl8EYqk7owT73",
    "email": "user@example.com",
    "name": "John Doe",
    "idToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "AEu4Il2...",
    "expiresIn": "3600",
    "profile": {
      "currency": "USD",
      "monthlyBudget": 0,
      "savingsGoal": 0,
      "preferences": {
        "notifications": true,
        "theme": "light",
        "language": "en"
      }
    }
  },
  "timestamp": "2025-11-12T19:22:27.025Z"
}
```

### 3. Protected Routes
Include the ID token in all protected requests:

```
Authorization: Bearer <ID_TOKEN>
```

---

## Transaction Endpoints

### List Transactions
**Endpoint:** `GET /api/transactions`

**Query Parameters:**
- `type` - Filter by type: `income`, `expense`, or `savings`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "transactions": [
      {
        "id": "trans_001",
        "userId": "nlILNDJtNDQkaOIIl8EYqk7owT73",
        "type": "expense",
        "amount": 42.5,
        "category": "Food",
        "description": "Lunch at cafe",
        "date": "2025-01-12T12:15:00.000Z",
        "tags": ["lunch", "eating out"],
        "recurring": false,
        "createdAt": "2025-01-12T12:20:30.100Z",
        "updatedAt": "2025-01-12T12:20:30.100Z"
      }
    ],
    "summary": {
      "totalIncome": 2500,
      "totalExpenses": 850,
      "totalSavings": 200,
      "count": 12
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "totalPages": 2
    }
  }
}
```

### Create Transaction
**Endpoint:** `POST /api/transactions`

**Request:**
```json
{
  "type": "expense",
  "amount": 42.5,
  "category": "Food",
  "description": "Lunch at cafe",
  "date": "2025-01-12",
  "tags": ["lunch", "eating out"],
  "recurring": false
}
```

### Update Transaction
**Endpoint:** `PUT /api/transactions/{transactionId}`

**Request (partial updates allowed):**
```json
{
  "amount": 55,
  "description": "Updated lunch expense"
}
```

### Delete Transaction
**Endpoint:** `DELETE /api/transactions/{transactionId}`

---

## User Profile & Budget

### Get Profile
**Endpoint:** `GET /api/user/profile`

### Update Profile
**Endpoint:** `PUT /api/user/profile`

**Request:**
```json
{
  "name": "Jane Doe",
  "currency": "EUR"
}
```

### Get Budget
**Endpoint:** `GET /api/user/budget?month=1&year=2025`

### Update Budget
**Endpoint:** `POST /api/user/budget`

**Request:**
```json
{
  "monthlyBudget": 3000,
  "savingsGoal": 15000,
  "categoryBudgets": {
    "Food": 500,
    "Transport": 200
  }
}
```

---

## AI Insights

### Chat with AI
**Endpoint:** `POST /api/insights/chat`

**Request:**
```json
{
  "message": "How can I reduce my expenses?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "response": "Based on your spending patterns, I suggest...",
    "suggestions": [
      "Reduce dining out by 15%",
      "Set up automatic savings transfers"
    ]
  }
}
```

### Generate Insights
**Endpoint:** `GET /api/insights/generate?period=month`

---

## Environment Configuration

Create `.env` file in project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

For production:
```env
VITE_API_BASE_URL=https://your-backend.vercel.app
```

---

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Re-login required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Contact support |

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get Profile (use token from login response)
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

📚 **For detailed setup instructions, see:**
- `BACKEND_INTEGRATION.md` - Complete integration guide
- `API_CONNECTION_GUIDE.md` - Troubleshooting & deployment

