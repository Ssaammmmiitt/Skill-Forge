from flask import Flask
import sys
import os

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.middleware import register_middleware
from api.routes import register_routes

def create_app():
    app = Flask(__name__)
    register_middleware(app)
    register_routes(app)
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
