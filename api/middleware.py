from flask import jsonify, request, make_response
import traceback

def success(data, status=200):
    """Standard success JSON response helper."""
    return jsonify({"data": data, "error": None, "status": status}), status

def error(msg, status=400):
    """Standard error JSON response helper."""
    return jsonify({"data": None, "error": msg, "status": status}), status

def register_middleware(app):
    """Registers global CORS middleware and error handlers."""
    
    @app.before_request
    def handle_options_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            return response, 200

    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

    @app.errorhandler(404)
    def handle_404(e):
        return error("Not found", 404)

    @app.errorhandler(500)
    def handle_500(e):
        app.logger.error(f"500 Error: {e}")
        return error("Internal server error", 500)

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        # Log the full stack trace to console for developers but keep response clean
        traceback.print_exc()
        return error("Internal server error", 500)
