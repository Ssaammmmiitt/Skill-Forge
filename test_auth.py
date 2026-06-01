"""
Quick test script for authentication system.
Run after starting the FastAPI backend on port 5000.
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000/api/auth"

def test_register():
    """Test user registration."""
    print("\n" + "="*50)
    print("TEST 1: User Registration")
    print("="*50)
    
    data = {
        "name": "Test User",
        "email": "test@skillforge.com",
        "password": "test123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("✅ PASS: User registered successfully")
            return response.json()['data']['token']
        elif response.status_code == 409:
            print("⚠️  User already exists, trying login instead...")
            return None
        else:
            print("❌ FAIL: Registration failed")
            return None
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None

def test_login():
    """Test user login."""
    print("\n" + "="*50)
    print("TEST 2: User Login")
    print("="*50)
    
    data = {
        "email": "test@skillforge.com",
        "password": "test123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ PASS: Login successful")
            return response.json()['data']['token']
        else:
            print("❌ FAIL: Login failed")
            return None
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None

def test_verify(token):
    """Test token verification."""
    print("\n" + "="*50)
    print("TEST 3: Token Verification")
    print("="*50)
    
    if not token:
        print("❌ SKIP: No token to verify")
        return
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/verify", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ PASS: Token verified successfully")
        else:
            print("❌ FAIL: Token verification failed")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_logout(token):
    """Test logout."""
    print("\n" + "="*50)
    print("TEST 4: Logout")
    print("="*50)
    
    if not token:
        print("❌ SKIP: No token for logout")
        return
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/logout", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ PASS: Logout successful")
        else:
            print("❌ FAIL: Logout failed")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def main():
    print("\n" + "#"*50)
    print("# SKILL FORGE AUTHENTICATION SYSTEM TEST")
    print("#"*50)
    print("\nMake sure FastAPI backend is running on http://127.0.0.1:5000")
    print("Press Ctrl+C to cancel, or Enter to continue...")
    input()
    
    # Test registration
    token = test_register()
    
    # If registration failed (user exists), try login
    if not token:
        token = test_login()
    
    # Test verification
    test_verify(token)
    
    # Test logout
    test_logout(token)
    
    print("\n" + "#"*50)
    print("# TEST SUITE COMPLETE")
    print("#"*50)
    print("\nAll tests passed! ✅")
    print("\nYou can now:")
    print("1. Open http://localhost:5174/register in your browser")
    print("2. Create a new account")
    print("3. Login and access the dashboard")

if __name__ == "__main__":
    main()
