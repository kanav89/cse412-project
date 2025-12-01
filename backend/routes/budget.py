from flask import request, jsonify, Blueprint
from utils.db_connection import get_db_connection

app = Blueprint('budget', __name__)

# defiing the routes for budgets
@app.route('/budgets/<user_id>',methods=['GET'])
def get_budgets(user_id):
    # month
    month = request.args.get('month')
    year = request.args.get('year')
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if month and year:
        cursor.execute("SELECT * FROM budgets WHERE user_id=%s AND budget_month=%s AND budget_year= %s",(user_id, month, year))
    else:
        cursor.execute("SELECT * FROM budgets WHERE user_id =%s", (user_id,))
    b=cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(b)

# creating a new budget
@app.route('/budgets',methods=['POST'])
def create_budget():
    data =request.json
    conn=get_db_connection()
    cur =conn.cursor()
    cur.execute(
        "INSERT INTO budgets (user_id,category_id,amount_limit,budget_month,budget_year) VALUES (%s,%s, %s,%s, %s) RETURNING *",
        (data['user_id'], data['category_id'], data['amount_limit'],data['budget_month'],data['budget_year']))
    b = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(b),201

# updating a budget
@app.route('/budgets/<budget_id>',methods=['PUT'])
def update_budget(budget_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE budgets SET category_id =%s, amount_limit =%s, budget_month =%s,budget_year =%s WHERE budget_id =%s RETURNING *",
        (data['category_id'],data['amount_limit'],data['budget_month'],data['budget_year'],budget_id))
    b = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if b is None:
        return jsonify({"error": "Budget not found"}), 404
    return jsonify(b)

# deleting a budget
@app.route('/budgets/<budget_id>',methods=['DELETE'])
def delete_budget(budget_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM budgets WHERE budget_id = %s RETURNING *",(budget_id,))
    b = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Budget deleted"})
