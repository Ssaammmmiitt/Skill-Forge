from flask import Flask
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.middleware import register_middleware
from api.routes import register_routes
from api.auth import register_auth_routes

def create_app():
    app = Flask(__name__)
    
    # Set configuration from environment variables
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
    app.config['DEBUG'] = os.environ.get('DEBUG', 'True').lower() == 'true'
    app.config['FLASK_ENV'] = os.environ.get('FLASK_ENV', 'development')
    
    register_middleware(app)
    register_routes(app)
    register_auth_routes(app)
    
    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    app.run(debug=debug, port=port)
