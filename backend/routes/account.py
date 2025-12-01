from flask import request, jsonify, Blueprint
from utils.db_connection import get_db_connection

app = Blueprint('account',__name__)

# routes for the accounts
@app.route('/accounts/<user_id>',methods=['GET'])
def get_accounts(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM accounts WHERE user_id = %s", (user_id,))
    a =cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(a)

# creating a new account
@app.route('/accounts', methods=['POST'])
def create_account():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO accounts (user_id, account_name, account_type, current_balance) VALUES (%s, %s, %s, %s) RETURNING *",
        (data['user_id'],data['account_name'],data['account_type'],data.get('current_balance', 0)))
    a = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(a)

# updating a single account
@app.route('/accounts/<account_id>',methods=['PUT'])
def update_account(account_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE accounts SET account_name = %s, account_type=%s, current_balance=%s WHERE account_id=%s RETURNING *",
        (data['account_name'], data['account_type'], data['current_balance'],account_id))
    a = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(a)

# delting a account
@app.route('/accounts/<account_id>', methods=['DELETE'])
def delete_account(account_id):
    conn = get_db_connection()
    cursor =conn.cursor()
    cursor.execute("DELETE FROM accounts WHERE account_id=%s RETURNING *", (account_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Account deleted"})
