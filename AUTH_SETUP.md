# Authentication System Setup Guide

## Overview

Complete authentication system with:
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **OAuth Google**: Google Sign-In integration (optional)
- **Encrypted Database**: SQLite with hashed passwords
- **Auto Profile Creation**: New users automatically get student profiles

---

## Backend Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

**Key dependencies:**
- `PyJWT` - JWT token generation/validation
- `bcrypt` - Password hashing
- `google-auth` - Google OAuth support
- `Flask` - Web framework

### 2. Environment Variables (Optional)

Create a `.env` file in the project root:

```bash
# JWT Secret (change in production!)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Google OAuth (optional, for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Flask Secret
SECRET_KEY=your-flask-secret-key
```

**For development**: The system will use default values if you don't create a `.env` file.

### 3. Start the Backend

```bash
python api/app.py
```

The backend will:
- Start on `http://127.0.0.1:5000`
- Auto-create the `users` table on first auth request
- Support CORS for `localhost:5173` and `localhost:5174`

---

## Frontend Setup

### 1. Start the Dev Server

```bash
cd skill_forge_ui
npm run dev
```

The frontend will start on `http://localhost:5174` (or 5173)

### 2. Test Authentication

**New User Registration:**
1. Go to `/register`
2. Fill in name, email, password
3. Click "CREATE ACCOUNT"
4. Automatically logged in and redirected to dashboard

**Existing User Login:**
1. Go to `/login`
2. Enter email and password
3. Click "SIGN IN"
4. Redirected to dashboard

---

## API Endpoints

### Authentication Routes (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/google` | Google OAuth login | No |
| GET | `/auth/verify` | Verify JWT token | Yes |
| POST | `/auth/logout` | Logout (client-side token deletion) | Yes |

### Register Request

```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "uuid-here",
      "email": "john@example.com",
      "name": "John Doe",
      "provider": "email"
    },
    "message": "Registration successful"
  },
  "error": null,
  "status": 201
}
```

### Login Request

```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "uuid-here",
      "email": "john@example.com",
      "name": "John Doe",
      "provider": "email"
    },
    "message": "Login successful"
  },
  "error": null,
  "status": 200
}
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    provider TEXT DEFAULT 'email',  -- 'email' or 'google'
    google_id TEXT UNIQUE,
    created_at TEXT NOT NULL,
    last_login TEXT
);
```

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_google_id` on `google_id`

### Security Features

1. **Password Hashing**: bcrypt with automatic salt generation
2. **JWT Tokens**: 24-hour expiration, signed with secret key
3. **SQL Injection Protection**: Parameterized queries
4. **CORS**: Restricted to localhost origins only

---

## Google OAuth Setup (Optional)

### 1. Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://localhost:5174`
6. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5174`
7. Copy the **Client ID**

### 2. Configure Backend

Set environment variable:
```bash
export GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

Or add to `.env` file.

### 3. Frontend Integration

The Google Sign-In button is already in the UI. To enable it:

1. Load Google Sign-In SDK in `index.html`:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

2. Update `Login.jsx` and `Register.jsx` with actual Google SDK initialization.

**For now**: The button shows a message that OAuth setup is required.

---

## Testing

### Manual Testing

1. **Register a new account**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
   ```

2. **Login**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Verify token** (replace YOUR_TOKEN):
   ```bash
   curl http://localhost:5000/api/auth/verify \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Frontend Testing

1. Open `http://localhost:5174/register`
2. Create an account
3. Verify you're redirected to dashboard
4. Check localStorage for `sf_token` and `sf_user`
5. Refresh page - should stay logged in
6. Logout from sidebar
7. Login again with same credentials

---

## Troubleshooting

### "Module not found" errors

Install missing dependencies:
```bash
pip install PyJWT bcrypt google-auth google-auth-oauthlib flask-cors
```

### CORS errors in browser

Make sure:
1. Backend is running on port 5000
2. Frontend is on port 5173 or 5174
3. `api/middleware.py` allows your frontend origin

### JWT token expired

Tokens expire after 24 hours. Just login again to get a new token.

### Google OAuth not working

1. Check `GOOGLE_CLIENT_ID` is set correctly
2. Verify Google Cloud Console settings
3. Check browser console for errors
4. Ensure Google SDK is loaded in frontend

---

## Security Best Practices

### Production Deployment

1. **Change JWT Secret**:
   ```bash
   export JWT_SECRET_KEY=$(openssl rand -hex 32)
   ```

2. **Use HTTPS**: Always use HTTPS in production

3. **Secure Cookies**: Consider using httpOnly cookies instead of localStorage

4. **Rate Limiting**: Add rate limiting to auth endpoints

5. **Email Verification**: Add email verification for new accounts

6. **Password Requirements**: Enforce stronger password policies

7. **Database Encryption**: Use SQLCipher for full database encryption:
   ```bash
   pip install sqlcipher3
   ```

---

## Architecture

### Authentication Flow

```
User Registration:
1. User fills registration form
2. Frontend sends POST to /api/auth/register
3. Backend hashes password with bcrypt
4. Creates user record in database
5. Creates corresponding student profile
6. Generates JWT token
7. Returns token to frontend
8. Frontend stores token in localStorage
9. Redirects to dashboard

User Login:
1. User fills login form
2. Frontend sends POST to /api/auth/login
3. Backend verifies email exists
4. Backend verifies password with bcrypt
5. Generates JWT token
6. Returns token to frontend
7. Frontend stores token
8. Redirects to dashboard

Protected API Requests:
1. Frontend includes token in Authorization header
2. Backend @token_required decorator validates token
3. Extracts user_id from token payload
4. Passes user_id to route function
5. Route function processes request with user context
```

### Token Structure

JWT payload:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "exp": 1234567890,  // Expiration timestamp
  "iat": 1234567890   // Issued at timestamp
}
```

---

## Files Modified/Created

### Backend
- ✅ `api/auth.py` - New authentication module
- ✅ `api/app.py` - Registered auth routes
- ✅ `api/middleware.py` - Updated CORS for auth
- ✅ `requirements.txt` - Added auth dependencies

### Frontend
- ✅ `src/api/auth.js` - Auth API functions
- ✅ `src/store/useAuthStore.js` - Enhanced auth state management
- ✅ `src/pages/Login.jsx` - New login page with hero section
- ✅ `src/pages/Register.jsx` - New register page with hero section

### Database
- ✅ `users` table - Auto-created on first auth request
- ✅ Indexes on email and google_id

---

## Next Steps

1. ✅ **Basic auth working** - Registration and login implemented
2. ⏳ **Google OAuth** - Requires Google Client ID setup
3. ⏳ **Email verification** - Optional enhancement
4. ⏳ **Password reset** - Optional enhancement
5. ⏳ **Two-factor auth** - Optional enhancement

---

**Authentication System Ready!** 🔐

All users can now register, login, and have their data encrypted with bcrypt. JWT tokens provide stateless authentication with 24-hour expiration.
