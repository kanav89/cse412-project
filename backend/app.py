from flask import Flask, request, jsonify
import psycopg2
from flask_cors import CORS


# cors
app = Flask(__name__)
CORS(app)

from routes.user import app as user_routes
from routes.account import app as account_routes
from routes.transaction import app as transaction_routes
from routes.budget import app as budget_routes

app.register_blueprint(user_routes)
app.register_blueprint(account_routes)
app.register_blueprint(transaction_routes)
app.register_blueprint(budget_routes)

@app.route('/')
def index():
    return jsonify({"message": "Finance Tracker API", "status": "running"})

if __name__ == '__main__':
    app.run(debug=True)

