from flask import Flask, request, jsonify, send_file
import psycopg2

from utils.db_connection import DatabaseConnectionError

app = Flask(__name__)

from routes.user import app as user_routes
from routes.account import app as account_routes
from routes.transaction import app as transaction_routes
from routes.budget import app as budget_routes

app.register_blueprint(user_routes)
app.register_blueprint(account_routes)
app.register_blueprint(transaction_routes)
app.register_blueprint(budget_routes)


@app.errorhandler(DatabaseConnectionError)
def handle_database_connection_error(error):
    response = jsonify({
        "error": "Database connection failed",
        "message": str(error)
    })
    response.status_code = 500
    return response

@app.route('/')
def index():
    return send_file('index.html')

if __name__ == '__main__':
    app.run(debug=True)
