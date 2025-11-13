# 🚀 Backend Integration Complete

## ✅ What's Been Updated

The frontend has been fully integrated with your Firebase + Next.js backend API. All endpoints now match the API reference document exactly.

### Key Changes Made:

1. **API Response Envelope** - All responses now use the standard format:
```json
{
  "success": true,
  "message": "Human‑friendly status",
  "data": {},
  "timestamp": "ISO-8601"
}
```

2. **Authentication Flow** - Uses `idToken` from Firebase:
   - Login returns `idToken` + `refreshToken`
   - Token stored in localStorage
   - Sent as `Authorization: Bearer <ID_TOKEN>` header

3. **Error Handling** - Proper handling for:
   - 401 errors (auto-logout on token expiry)
   - Network errors (clear messaging)
   - CORS issues (helpful troubleshooting)

4. **Environment Configuration**
   - API URL configurable via `VITE_API_BASE_URL`
   - Defaults to `http://localhost:3000`

---

## 📡 API Endpoints Integrated

### Authentication
- ✅ `POST /api/auth/register` - Create new user
- ✅ `POST /api/auth/login` - Login with email/password
- ✅ `POST /api/auth/logout` - Revoke refresh tokens
- ✅ `GET /api/auth/verify` - Validate token (used for route protection)

### Transactions
- ✅ `GET /api/transactions` - List with pagination & filters
- ✅ `POST /api/transactions` - Create transaction
- ✅ `PUT /api/transactions/{id}` - Update transaction
- ✅ `DELETE /api/transactions/{id}` - Delete transaction
- ✅ `GET /api/transactions/stats` - Get statistics (ready for integration)

### User Profile & Budget
- ✅ `GET /api/user/profile` - Get user profile
- ✅ `PUT /api/user/profile` - Update profile
- ✅ `GET /api/user/budget` - Get budget by month/year
- ✅ `POST /api/user/budget` - Update budget goals
- ✅ `GET /api/user/settings` - Get user settings
- ✅ `PUT /api/user/settings` - Update settings

### AI Insights
- ✅ `POST /api/insights/chat` - Chat with AI assistant
- ✅ `GET /api/insights/generate` - Generate insights
- ✅ `GET /api/insights/history` - View insight history

---

## 🔧 How to Connect Your Backend

### Option 1: Local Development (Easiest)

1. **Start your backend:**
```bash
cd your-backend-folder
npm run dev
# Backend runs on http://localhost:3000
```

2. **Clone and start this frontend:**
```bash
git clone <YOUR_GIT_URL>
cd <PROJECT_NAME>
npm install
npm run dev
# Frontend runs on http://localhost:8080
```

✅ Both are running locally - they can communicate!

### Option 2: Deploy Backend (Production)

1. **Deploy backend to Vercel:**
```bash
cd your-backend-folder
vercel deploy
# Get URL: https://your-app.vercel.app
```

2. **Set environment variable:**
   - Update your deployment settings or local environment configuration
   - Add: `VITE_API_BASE_URL=https://your-app.vercel.app`
   - Or create `.env` file locally:
```env
VITE_API_BASE_URL=https://your-app.vercel.app
```

3. **Configure CORS on backend:**
```javascript
// Add to your backend API middleware
const allowedOrigins = [
  'https://your-frontend-domain.com',
  'http://localhost:8080'
];
```

---

## 🧪 Testing the Integration

### 1. Test Registration
```bash
# Should create user and auto-login
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### 2. Test Login
```bash
# Should return idToken + user data
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Test Protected Endpoint
```bash
# Replace TOKEN with idToken from login response
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"
**Cause:** Frontend can't reach backend URL  
**Fix:**
- ✅ Backend is running: `curl http://localhost:3000/api/auth/verify`
- ✅ URL is correct in `.env`
- ✅ No firewall blocking

### Error: "Failed to fetch" (CORS)
**Cause:** CORS headers not set on backend  
**Fix:** Add CORS headers to all API routes:
```javascript
res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### Error: "401 Unauthorized"
**Cause:** Token expired or invalid  
**Fix:** 
- User will be auto-logged out
- Login again to get fresh token
- Check Firebase credentials on backend

### Error: "Network request failed"
**Cause:** Backend not deployed or URL wrong  
**Fix:**
- Verify backend URL is accessible
- Check environment variable is set
- Test with curl/Postman first

---

## 📝 Data Flow

```
User Action
    ↓
Frontend Component
    ↓
API Call (src/lib/api.ts)
    ↓
HTTP Request → Backend API
    ↓
Firebase Auth Validation
    ↓
Firestore Database
    ↓
Response Envelope
    ↓
Frontend Updates UI
    ↓
Toast Notification
```

---

## 🎯 Next Steps

1. **Start Backend Locally** - Test all features work
2. **Create Test Data** - Add transactions, set budgets
3. **Test AI Chat** - Ensure insights endpoint works
4. **Deploy Backend** - Push to Vercel/Railway
5. **Update ENV** - Point frontend to production URL
6. **Final Testing** - Test all features in production

---

## 📚 Related Files

- `src/lib/api.ts` - All API integration code
- `src/contexts/AuthContext.tsx` - Authentication state
- `.env.example` - Environment variable template
- `API_CONNECTION_GUIDE.md` - Detailed setup instructions

---

## ⚡ Quick Reference

| Feature | Endpoint | Method | Auth Required |
|---------|----------|--------|---------------|
| Register | `/api/auth/register` | POST | No |
| Login | `/api/auth/login` | POST | No |
| Get Profile | `/api/user/profile` | GET | Yes |
| List Transactions | `/api/transactions` | GET | Yes |
| Create Transaction | `/api/transactions` | POST | Yes |
| Chat with AI | `/api/insights/chat` | POST | Yes |

---

**Ready to go! 🎉** Start your backend and test the full integration.
