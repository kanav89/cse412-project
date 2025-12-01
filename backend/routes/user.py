from flask import request, jsonify, Blueprint
from utils.db_connection import get_db_connection

app = Blueprint('user', __name__)

# routes for the users

# creating a new user
@app.route('/users',methods=['POST'])
def create_user():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (first_name,last_name,email,password) VALUES (%s,%s,%s,%s) RETURNING *",(data['first_name'],data['last_name'],data['email'],data['password']))
    user = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(user), 201

# logging route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db_connection()
    cursosr = conn.cursor()
    cursosr.execute("SELECT * FROM users WHERE email = %s AND password = %s",(data['email'],data['password']))
    user = cursosr.fetchone()
    cursosr.close()
    conn.close()
    
    if user is None:
        return jsonify({"message": "Invalid email or password"}), 401
    
    return jsonify({"message": "Login successful","user": user})

# dashboard summary
@app.route('/dashboard/<int:user_id>', methods=['GET'])
def get_dashboard(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get total balance across all accounts
    cursor.execute(
        "SELECT COALESCE(SUM(current_balance), 0) FROM accounts WHERE user_id = %s",
        (user_id,)
    )
    total_balance = cursor.fetchone()[0]
    
    # Get account count
    cursor.execute(
        "SELECT COUNT(*) FROM accounts WHERE user_id = %s",
        (user_id,)
    )
    account_count = cursor.fetchone()[0]
    
    # Get transaction count for current month
    cursor.execute(
        "SELECT COUNT(*) FROM transaction WHERE user_id = %s AND EXTRACT(MONTH FROM transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)",
        (user_id,)
    )
    transaction_count = cursor.fetchone()[0]
    
    # Get budget count
    cursor.execute(
        "SELECT COUNT(*) FROM budgets WHERE user_id = %s",
        (user_id,)
    )
    budget_count = cursor.fetchone()[0]
    
    # Get recent transactions (last 5)
    cursor.execute(
        """SELECT t.transaction_id, t.user_id, t.account_id, t.category_id, 
                  t.transaction_date, t.amount, t.description,
                  a.account_name, c.category_name
           FROM transaction t
           JOIN accounts a ON t.account_id = a.account_id
           JOIN category c ON t.category_id = c.category_id
           WHERE t.user_id = %s
           ORDER BY t.transaction_date DESC
           LIMIT 5""",
        (user_id,)
    )
    recent_transactions = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify({
        "total_balance": float(total_balance),
        "account_count": account_count,
        "transaction_count": transaction_count,
        "budget_count": budget_count,
        "recent_transactions": recent_transactions
    })





