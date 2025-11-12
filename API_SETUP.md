# FinanceAI - API Setup Guide

## API Endpoints Overview

This frontend connects to your backend API running at `http://localhost:3000/api`. Make sure your backend server is running before using the application.

### Authentication Endpoints

**Login**
- **URL:** `POST /api/auth/login`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
- **Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "uid": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Register**
- **URL:** `POST /api/auth/register`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

### User Profile Endpoints

**Get Profile**
- **URL:** `GET /api/user/profile`
- **Headers:** `Authorization: Bearer {token}`

**Update Profile**
- **URL:** `PUT /api/user/profile`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
```json
{
  "name": "Jane Doe",
  "currency": "EUR"
}
```

### Budget Endpoints

**Get Budget**
- **URL:** `GET /api/user/budget?month={month}&year={year}`
- **Headers:** `Authorization: Bearer {token}`

**Update Budget**
- **URL:** `POST /api/user/budget`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
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

### Transaction Endpoints

**Get All Transactions**
- **URL:** `GET /api/transactions?type={type}&page={page}&limit={limit}`
- **Headers:** `Authorization: Bearer {token}`

**Create Transaction**
- **URL:** `POST /api/transactions`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
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

**Update Transaction**
- **URL:** `POST /api/transactions/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
```json
{
  "amount": 55.00,
  "description": "Updated description"
}
```

**Delete Transaction**
- **URL:** `DELETE /api/transactions/{id}`
- **Headers:** `Authorization: Bearer {token}`

### AI Insights Endpoint

**Get AI Insights**
- **URL:** `POST /api/insights`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
```json
{
  "message": "How can I reduce my expenses?"
}
```

## Configuration

The API base URL is configured in `src/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

Change this if your backend is hosted elsewhere.

## Authentication Flow

1. User logs in/registers
2. Backend returns JWT token
3. Token is stored in localStorage
4. All subsequent requests include the token in Authorization header
5. On logout, token is removed from localStorage

## Error Handling

The application includes toast notifications for:
- Successful operations (green)
- Errors and failures (red)
- Loading states with spinners

All API calls are wrapped with try-catch blocks and user-friendly error messages.
