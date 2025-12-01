from flask import Flask, request, jsonify, send_file
import psycopg2

app = Flask(__name__)

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
    return send_file('index.html')

if __name__ == '__main__':
    app.run(debug=True)

