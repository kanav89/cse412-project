from flask import request, jsonify, Blueprint
from utils.db_connection import get_db_connection

app = Blueprint('transaction', __name__)
# getting the categoires

@app.route('/categories',methods=['GET'])
def get_categories():
    conn =get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM category")
    cat = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(cat)

# getting a transaction for the user
@app.route('/transactions/<user_id>',methods=['GET'])
def get_transactions(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM transaction WHERE user_id = %s ORDER BY transaction_date DESC", (user_id,))
    t = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(t)

# creating the origin
@app.route('/transactions',methods=['POST'])
def create_transaction():
    data = request.json
    conn =get_db_connection()
    cursor =conn.cursor()
    
    cursor.execute(
        "INSERT INTO transaction (user_id, account_id, category_id, transaction_date, amount, description) VALUES (%s, %s, %s, %s, %s, %s) RETURNING *",
        (data['user_id'], data['account_id'],data['category_id'],data['transaction_date'],data['amount'],data.get('description','')))
    t=cursor.fetchone()
    cursor.execute(
        "UPDATE accounts SET current_balance = current_balance + %s WHERE account_id = %s",(data['amount'],data['account_id']))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(t)

@app.route('/transactions/<transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transaction WHERE transaction_id =%s",(transaction_id,))
    t = cursor.fetchone()
    
    cursor.execute("UPDATE accounts SET current_balance = current_balance - %s WHERE account_id = %s",(t[5],t[2]))
    cursor.execute("DELETE FROM transaction WHERE transaction_id = %s",(transaction_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message":"Transaction deleted"})
