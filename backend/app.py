from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)


# ==============================
# DATABASE CONNECTION
# ==============================

def get_db_connection():
    connection = sqlite3.connect("studysync.db")
    connection.row_factory = sqlite3.Row
    return connection


# ==============================
# CREATE DATABASE
# ==============================

def create_database():

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            task TEXT NOT NULL,
            time TEXT NOT NULL,
            completed INTEGER DEFAULT 0
        )
    """)

    connection.commit()
    connection.close()


# ==============================
# HOME
# ==============================

@app.route("/")
def home():

    return "StudySync Backend is Running!"


# ==============================
# GET ALL TASKS
# ==============================

@app.route("/api/tasks", methods=["GET"])
def get_tasks():

    connection = get_db_connection()

    tasks = connection.execute(
        "SELECT * FROM tasks ORDER BY id DESC"
    ).fetchall()

    connection.close()

    task_list = []

    for task in tasks:

        task_list.append({
            "id": task["id"],
            "subject": task["subject"],
            "task": task["task"],
            "time": task["time"],
            "completed": bool(task["completed"])
        })

    return jsonify(task_list)


# ==============================
# ADD NEW TASK
# ==============================

@app.route("/api/tasks", methods=["POST"])
def add_task():

    data = request.get_json()

    # Check if JSON data was received
    if not data:
        return jsonify({
            "error": "Request data is required"
        }), 400

    subject = data.get("subject")
    task = data.get("task")
    time = data.get("time")

    # Remove unnecessary spaces
    if subject:
        subject = subject.strip()

    if task:
        task = task.strip()

    if time:
        time = time.strip()

    # Check required fields
    if not subject:
        return jsonify({
            "error": "Subject is required"
        }), 400

    if not task:
        return jsonify({
            "error": "Task name is required"
        }), 400

    if not time:
        return jsonify({
            "error": "Time is required"
        }), 400

    # Save task
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO tasks
        (subject, task, time, completed)
        VALUES (?, ?, ?, ?)
    """, (subject, task, time, 0))

    connection.commit()

    new_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "message": "Task added successfully",
        "id": new_id,
        "subject": subject,
        "task": task,
        "time": time,
        "completed": False
    }), 201


# ==============================
# UPDATE TASK
# ==============================

@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request data is required"
        }), 400

    subject = data.get("subject")
    task = data.get("task")
    time = data.get("time")
    completed = data.get("completed")

    # Validate text fields
    if not subject or not str(subject).strip():
        return jsonify({
            "error": "Subject is required"
        }), 400

    if not task or not str(task).strip():
        return jsonify({
            "error": "Task name is required"
        }), 400

    if not time or not str(time).strip():
        return jsonify({
            "error": "Time is required"
        }), 400

    # Validate completed field
    if completed not in [True, False, 0, 1]:
        return jsonify({
            "error": "Completed must be true or false"
        }), 400

    subject = str(subject).strip()
    task = str(task).strip()
    time = str(time).strip()
    completed = int(bool(completed))

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE tasks
        SET subject = ?, task = ?, time = ?, completed = ?
        WHERE id = ?
    """, (subject, task, time, completed, task_id))

    connection.commit()

    if cursor.rowcount == 0:

        connection.close()

        return jsonify({
            "error": "Task not found"
        }), 404

    connection.close()

    return jsonify({
        "message": "Task updated successfully"
    })


# ==============================
# DELETE TASK
# ==============================

@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM tasks WHERE id = ?",
        (task_id,)
    )

    connection.commit()

    if cursor.rowcount == 0:

        connection.close()

        return jsonify({
            "error": "Task not found"
        }), 404

    connection.close()

    return jsonify({
        "message": "Task deleted successfully"
    })


# ==============================
# START APPLICATION
# ==============================

if __name__ == "__main__":

    create_database()

    app.run(debug=True)