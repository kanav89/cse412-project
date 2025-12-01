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
    return jsonify({"message": "Login successful","user": user})





