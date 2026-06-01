"""
Authentication module with JWT, password hashing, and OAuth support.
"""
import os
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import Blueprint, request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Import database models
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from skill_forge.data.models import get_db, Student, insert_student
from api.middleware import success, error

# Auth Blueprint
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")

# ── Utility Functions ──────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a bcrypt hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_jwt_token(user_id: str, email: str) -> str:
    """Generate a JWT token for a user."""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require valid JWT token for protected routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # "Bearer <token>"
            except IndexError:
                return error("Invalid authorization header format", 401)
        
        if not token:
            return error("Authentication token is missing", 401)
        
        payload = decode_jwt_token(token)
        if not payload:
            return error("Invalid or expired token", 401)
        
        # Add user info to kwargs
        return f(user_id=payload['user_id'], *args, **kwargs)
    
    return decorated

# ── Database Functions ─────────────────────────────────────────────────────────

def create_auth_tables(conn):
    """Create users table if it doesn't exist."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            name TEXT NOT NULL,
            provider TEXT DEFAULT 'email',
            google_id TEXT UNIQUE,
            created_at TEXT NOT NULL,
            last_login TEXT
        )
    """)
    
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    """)
    
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)
    """)

def get_user_by_email(conn, email: str):
    """Get user by email."""
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if row:
        return dict(row)
    return None

def get_user_by_id(conn, user_id: str):
    """Get user by user_id."""
    row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
    if row:
        return dict(row)
    return None

def get_user_by_google_id(conn, google_id: str):
    """Get user by Google ID."""
    row = conn.execute("SELECT * FROM users WHERE google_id = ?", (google_id,)).fetchone()
    if row:
        return dict(row)
    return None

def insert_user(conn, user_data: dict):
    """Insert a new user."""
    conn.execute("""
        INSERT INTO users (user_id, email, password_hash, name, provider, google_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        user_data['user_id'],
        user_data['email'],
        user_data.get('password_hash'),
        user_data['name'],
        user_data.get('provider', 'email'),
        user_data.get('google_id'),
        user_data['created_at']
    ))

def update_last_login(conn, user_id: str):
    """Update user's last login timestamp."""
    now = datetime.now(timezone.utc).isoformat()
    conn.execute("UPDATE users SET last_login = ? WHERE user_id = ?", (now, user_id))

# ── Authentication Routes ───────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user with email and password."""
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "").strip()
    
    # Validation
    if not email or not password or not name:
        return error("Email, password, and name are required", 400)
    
    if len(password) < 6:
        return error("Password must be at least 6 characters", 400)
    
    if "@" not in email:
        return error("Invalid email format", 400)
    
    conn = get_db()
    try:
        create_auth_tables(conn)
        
        # Check if user already exists
        existing_user = get_user_by_email(conn, email)
        if existing_user:
            return error("User with this email already exists", 409)
        
        # Create user
        user_id = str(uuid.uuid4())
        user_data = {
            'user_id': user_id,
            'email': email,
            'password_hash': hash_password(password),
            'name': name,
            'provider': 'email',
            'google_id': None,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        insert_user(conn, user_data)
        
        # Create corresponding student profile
        student = Student(
            student_id=user_id,  # Use same ID for user and student
            name=name,
            INT=50,
            WIS=50,
            energy=80,
            xp=0,
            level=1,
            learning_style="unknown",
            streak=0
        )
        insert_student(conn, student)
        
        conn.commit()
        
        # Generate JWT token
        token = generate_jwt_token(user_id, email)
        
        return success({
            "token": token,
            "user": {
                "user_id": user_id,
                "email": email,
                "name": name,
                "provider": "email"
            },
            "message": "Registration successful"
        }, 201)
    finally:
        conn.close()

@auth_bp.route("/login", methods=["POST"])
def login():
    """Login with email and password."""
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    if not email or not password:
        return error("Email and password are required", 400)
    
    conn = get_db()
    try:
        create_auth_tables(conn)
        
        user = get_user_by_email(conn, email)
        if not user:
            return error("Invalid email or password", 401)
        
        # Verify password
        if not user.get('password_hash'):
            return error("This account uses social login. Please sign in with Google.", 400)
        
        if not verify_password(password, user['password_hash']):
            return error("Invalid email or password", 401)
        
        # Update last login
        update_last_login(conn, user['user_id'])
        conn.commit()
        
        # Generate JWT token
        token = generate_jwt_token(user['user_id'], user['email'])
        
        return success({
            "token": token,
            "user": {
                "user_id": user['user_id'],
                "email": user['email'],
                "name": user['name'],
                "provider": user['provider']
            },
            "message": "Login successful"
        })
    finally:
        conn.close()

@auth_bp.route("/google", methods=["POST"])
def google_login():
    """Login or register with Google OAuth."""
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    
    if not token:
        return error("Google token is required", 400)
    
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        google_id = idinfo['sub']
        email = idinfo.get('email', '').lower()
        name = idinfo.get('name', 'Google User')
        
        if not email:
            return error("Email not provided by Google", 400)
        
        conn = get_db()
        try:
            create_auth_tables(conn)
            
            # Check if user exists by Google ID
            user = get_user_by_google_id(conn, google_id)
            
            if not user:
                # Check if user exists by email
                user = get_user_by_email(conn, email)
                
                if user:
                    # Link Google account to existing user
                    conn.execute(
                        "UPDATE users SET google_id = ?, provider = 'google' WHERE user_id = ?",
                        (google_id, user['user_id'])
                    )
                    conn.commit()
                else:
                    # Create new user
                    user_id = str(uuid.uuid4())
                    user_data = {
                        'user_id': user_id,
                        'email': email,
                        'password_hash': None,
                        'name': name,
                        'provider': 'google',
                        'google_id': google_id,
                        'created_at': datetime.now(timezone.utc).isoformat()
                    }
                    insert_user(conn, user_data)
                    
                    # Create student profile
                    student = Student(
                        student_id=user_id,
                        name=name,
                        INT=50,
                        WIS=50,
                        energy=80,
                        xp=0,
                        level=1,
                        learning_style="unknown",
                        streak=0
                    )
                    insert_student(conn, student)
                    
                    conn.commit()
                    user = get_user_by_id(conn, user_id)
            
            # Update last login
            update_last_login(conn, user['user_id'])
            conn.commit()
            
            # Generate JWT token
            jwt_token = generate_jwt_token(user['user_id'], user['email'])
            
            return success({
                "token": jwt_token,
                "user": {
                    "user_id": user['user_id'],
                    "email": user['email'],
                    "name": user['name'],
                    "provider": user['provider']
                },
                "message": "Google login successful"
            })
        finally:
            conn.close()
            
    except ValueError as e:
        return error(f"Invalid Google token: {str(e)}", 401)

@auth_bp.route("/verify", methods=["GET"])
@token_required
def verify_token(user_id):
    """Verify if JWT token is still valid."""
    conn = get_db()
    try:
        create_auth_tables(conn)
        user = get_user_by_id(conn, user_id)
        if not user:
            return error("User not found", 404)
        
        return success({
            "user": {
                "user_id": user['user_id'],
                "email": user['email'],
                "name": user['name'],
                "provider": user['provider']
            },
            "message": "Token is valid"
        })
    finally:
        conn.close()

@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout(user_id):
    """Logout (client should delete token)."""
    return success({"message": "Logout successful. Please delete your token."})

def register_auth_routes(app):
    """Register authentication blueprint."""
    app.register_blueprint(auth_bp)
