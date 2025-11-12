# 🔌 Connecting Your Backend API

## Current Issue

The frontend is hosted on Lovable's servers but trying to reach `http://localhost:3000`, which only works on your local machine. You have two options:

---

## Option 1: Run Locally (Recommended for Development)

### Step 1: Clone the Project
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### Step 2: Start Your Backend
```bash
# In a separate terminal, start your Next.js backend
cd your-backend-folder
npm run dev
# Should be running on http://localhost:3000
```

### Step 3: Start the Frontend
```bash
# In the project folder
npm run dev
# Will open on http://localhost:8080
```

Now both frontend and backend are running locally and can communicate!

---

## Option 2: Deploy Backend & Connect (Production Setup)

### Step 1: Deploy Your Backend

Deploy your Next.js backend to a hosting service:
- **Vercel** (recommended for Next.js)
- **Railway**
- **Render**
- **Heroku**

Example with Vercel:
```bash
cd your-backend-folder
vercel deploy
# Will give you a URL like: https://your-app.vercel.app
```

### Step 2: Update API URL in Lovable

Create a `.env` file in your project root (or update environment variables in Lovable):

```env
VITE_API_BASE_URL=https://your-app.vercel.app
```

### Step 3: Configure CORS on Backend

Make sure your backend accepts requests from your Lovable domain:

```javascript
// In your Next.js API middleware or next.config.js
const allowedOrigins = [
  'https://bd2cc4d3-b43a-441b-96ce-cb5e7f143c42.lovableproject.com',
  'http://localhost:8080', // for local development
];

// Add CORS headers in your API routes
```

---

## Testing the Connection

### 1. Check Backend is Running
Visit your backend health endpoint:
- Local: http://localhost:3000/api/auth/verify
- Production: https://your-app.vercel.app/api/auth/verify

### 2. Test Registration
Try creating an account in the app. Check browser console (F12) for:
```
API Base URL: http://localhost:3000
```

If you see errors like "Failed to fetch", your backend isn't reachable.

### 3. Check CORS
If you see CORS errors, add these headers to your backend API routes:
```javascript
res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

---

## Environment Variables

The app uses `VITE_API_BASE_URL` to determine where to send API requests:

| Environment | URL |
|-------------|-----|
| Local Development | `http://localhost:3000` |
| Production | `https://your-backend.vercel.app` |

---

## Quick Troubleshooting

**Error: "Cannot connect to backend"**
- ✅ Backend server is running
- ✅ API URL is correct
- ✅ CORS is configured
- ✅ Firewall/network allows the connection

**Error: "401 Unauthorized"**
- Token expired (re-login)
- Backend authentication is misconfigured

**Error: "Failed to fetch"**
- Backend not running
- Wrong API URL
- CORS blocking the request

---

## Development Workflow

1. **Local Testing**: Run both frontend and backend locally
2. **Deploy Backend**: Push backend to Vercel/Railway
3. **Update ENV**: Set `VITE_API_BASE_URL` to production URL
4. **Test Production**: Try all features on Lovable preview

---

## Need Help?

1. Check browser console (F12 → Console tab)
2. Check network requests (F12 → Network tab)
3. Verify backend logs
4. Ensure Firebase credentials are set on backend
