# 🚀 Launch Guide - Authentication System

## Ready to Launch! ✅

Everything is configured and ready to use. Follow these simple steps:

---

## Step 1: Restart Your Backend

Your Flask backend needs to be restarted to load the new authentication routes.

```bash
# Stop the current backend (Ctrl+C in the terminal where it's running)
# Then restart:
python api/app.py
```

**Expected output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

---

## Step 2: Start/Restart Frontend

```bash
cd skill_forge_ui
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
```

---

## Step 3: Test the System

### Option A: Browser Test (Recommended)

1. **Open your browser** to `http://localhost:5174/register`

2. **Create a new account:**
   - Name: Your Name
   - Email: your@email.com
   - Password: test123 (or any password 6+ chars)
   - Click "CREATE ACCOUNT"

3. **Verify success:**
   - You should be auto-logged in
   - Redirected to Dashboard
   - Your name appears in the sidebar
   - Student profile is loaded

4. **Test logout:**
   - Click "LOGOUT" in the sidebar
   - Redirected to login page

5. **Test login:**
   - Enter same email/password
   - Click "SIGN IN"
   - Back to dashboard

### Option B: API Test (Optional)

Run the test script:

```bash
python test_auth.py
```

This will test:
- ✅ User Registration
- ✅ User Login
- ✅ Token Verification
- ✅ Logout

---

## What's New

### For Users
- 🎨 **Beautiful Hero Sections** - Landing pages with features/benefits
- 🔐 **Secure Registration** - Create account with email/password
- 🔑 **Secure Login** - Sign in with encrypted credentials
- 👤 **Auto Profile Creation** - Student profile created automatically
- 🔄 **Persistent Sessions** - Stay logged in across page refreshes
- 🚪 **Easy Logout** - One-click logout from sidebar

### For Developers
- 🔐 **JWT Authentication** - Token-based stateless auth
- 🔒 **Password Encryption** - bcrypt hashing
- 🛡️ **Protected Routes** - Decorator-based route protection
- 📊 **Database Integration** - Users linked to student profiles
- 🌐 **OAuth Ready** - Google Sign-In infrastructure (needs client ID)
- 📚 **Complete Documentation** - Setup guides and API docs

---

## New Pages

### Login (`/login`)
- Split-screen design
- Hero section with features
- Email/password form
- Google Sign-In button (ready)
- Link to register

### Register (`/register`)
- Split-screen design
- Hero section with benefits
- Full registration form
- Password confirmation
- Google Sign-Up button (ready)
- Link to login

---

## API Endpoints

All authentication endpoints: `/api/auth/`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | Create new account |
| `/auth/login` | POST | Sign in |
| `/auth/google` | POST | Google OAuth (needs setup) |
| `/auth/verify` | GET | Verify token |
| `/auth/logout` | POST | Sign out |

---

## File Structure

```
Skill-Forge/
├── api/
│   ├── app.py              ✅ Updated - registers auth routes
│   ├── auth.py             ✅ NEW - complete auth module
│   ├── middleware.py       ✅ Updated - CORS for auth
│   └── routes.py           (unchanged)
│
├── skill_forge_ui/src/
│   ├── api/
│   │   └── auth.js         ✅ NEW - auth API functions
│   ├── store/
│   │   └── useAuthStore.js ✅ Updated - enhanced auth state
│   └── pages/
│       ├── Login.jsx       ✅ NEW - redesigned with hero
│       ├── Register.jsx    ✅ NEW - redesigned with hero
│       ├── Login_old.jsx   (backup)
│       └── Register_old.jsx (backup)
│
├── requirements.txt        ✅ Updated - added auth deps
├── AUTH_SETUP.md           ✅ NEW - detailed setup guide
├── AUTH_IMPLEMENTATION_COMPLETE.md ✅ NEW - implementation summary
├── LAUNCH_GUIDE.md         ✅ NEW - this file
└── test_auth.py            ✅ NEW - test script
```

---

## Database Changes

### New Table: `users`

Auto-created on first auth request. Stores:
- User credentials (email, hashed password)
- OAuth info (Google ID, provider)
- Timestamps (created_at, last_login)

**Linked to students table:**
- `users.user_id` = `students.student_id` (1:1)
- When you register, both records created
- Login uses user credentials
- Profile uses student data

---

## Security Notes

### What's Encrypted
- ✅ Passwords (bcrypt)
- ✅ JWT tokens (signed)
- ✅ API requests (CORS protected)

### What's Stored
- **LocalStorage:** JWT token, user data (name, email, user_id)
- **Database:** Hashed passwords (never plain text)

### Token Expiration
- Tokens expire after **24 hours**
- Just login again to get a new token

---

## Troubleshooting

### "Cannot POST /api/auth/register"
**Fix:** Restart the backend to load auth routes

### CORS Error in Browser
**Fix:** Make sure:
- Backend on port 5000
- Frontend on port 5173 or 5174
- Both running

### "Student not found" Error
**Fix:** The student profile wasn't created. Check backend logs.

### Login Loop (keeps redirecting)
**Fix:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete `sf_token` and `sf_user`
4. Refresh page

### Old Login Page Still Shows
**Fix:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Restart Vite dev server

---

## Optional: Google OAuth Setup

The system is ready for Google Sign-In. To enable:

1. **Get Google Client ID:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add origins: `http://localhost:5173`, `http://localhost:5174`

2. **Set environment variable:**
   ```bash
   export GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

3. **Restart backend**

4. **Frontend SDK:**
   - Add Google SDK to `index.html`
   - Update `Login.jsx` to initialize SDK

**Current state:** Button shows "OAuth setup required" message

---

## Testing Checklist

Use this checklist to verify everything works:

### Registration Flow
- [ ] Open `http://localhost:5174/register`
- [ ] See hero section (desktop) or mobile logo
- [ ] Fill in all fields
- [ ] Click "CREATE ACCOUNT"
- [ ] Redirected to dashboard
- [ ] Name appears in sidebar
- [ ] LocalStorage has `sf_token` and `sf_user`

### Login Flow
- [ ] Click "LOGOUT" in sidebar
- [ ] Redirected to `/login`
- [ ] See hero section
- [ ] Enter credentials
- [ ] Click "SIGN IN"
- [ ] Redirected to dashboard
- [ ] Profile loads correctly

### Session Persistence
- [ ] While logged in, refresh page
- [ ] Still logged in (no redirect)
- [ ] Dashboard loads immediately
- [ ] Token still in localStorage

### Error Handling
- [ ] Try registering with existing email → Error shown
- [ ] Try login with wrong password → Error shown
- [ ] Try short password (< 6 chars) → Error shown
- [ ] Try invalid email format → Error shown

### Protected Routes
- [ ] While logged in, all pages work:
  - [ ] Dashboard
  - [ ] Profile
  - [ ] Analytics
  - [ ] Quiz
  - [ ] Logger
  - [ ] Leaderboard
  - [ ] Admin

---

## Success Criteria

Your auth system is working if:

1. ✅ You can create a new account
2. ✅ Password is accepted (6+ characters)
3. ✅ Auto-logged in after registration
4. ✅ Student profile appears in Dashboard
5. ✅ Can logout successfully
6. ✅ Can login with same credentials
7. ✅ Session persists on page refresh
8. ✅ All dashboard features work

---

## What to Tell Users

**"We've upgraded to a secure authentication system!"**

- Create your free account with email and password
- All passwords are encrypted (bcrypt)
- Sessions last 24 hours
- Your data is private and secure
- Google Sign-In coming soon (optional)

---

## Next Steps (Optional)

After verifying everything works:

1. **Production Deployment:**
   - Set `JWT_SECRET_KEY` environment variable (32+ chars)
   - Set `SECRET_KEY` environment variable
   - Enable HTTPS
   - Use production WSGI server (Gunicorn)

2. **Enhanced Security:**
   - Add email verification
   - Add password reset flow
   - Add rate limiting
   - Add 2FA (optional)

3. **Google OAuth:**
   - Get Google Client ID
   - Configure frontend SDK
   - Test Google Sign-In

---

## Support

### Documentation Files
- `AUTH_SETUP.md` - Detailed setup instructions
- `AUTH_IMPLEMENTATION_COMPLETE.md` - Technical implementation details
- `LAUNCH_GUIDE.md` - This file

### Test Script
- `test_auth.py` - Automated API testing

### Backup Files
- `src/pages/Login_old.jsx` - Original login page
- `src/pages/Register_old.jsx` - Original register page

---

## Quick Command Reference

```bash
# Start backend
python api/app.py

# Start frontend
cd skill_forge_ui && npm run dev

# Test auth API
python test_auth.py

# Install missing deps (if needed)
pip install PyJWT bcrypt google-auth
```

---

**🎉 You're all set! Go create your account and start learning!**

Visit: `http://localhost:5174/register`
