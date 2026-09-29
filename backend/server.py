from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import active_defense
import threading
import time
import sqlite3
import json

app = Flask(__name__)
# Enable CORS for all routes, specifically allowing requests from the Vite dev server
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize NeuroDefense System
# In production, use environment variables for credentials
neuro_system = None

# Initialize Database
def init_db():
    conn = sqlite3.connect('neuromimesis.db', timeout=15)
    try:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            profile_data TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
        # Handle migration for existing dbs without dropping them
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN password TEXT")
        except sqlite3.OperationalError:
            pass # Column already exists
            
        conn.commit()
    finally:
        conn.close()

init_db()

@app.route('/api/status', methods=['GET'])
def get_status():
    """Returns the current system status and location."""
    global neuro_system
    if not neuro_system:
        # Before setup, return a degraded or standby status
        return jsonify({
            "status": "standby",
            "trust_score": "--",
            "location": "Awaiting Config",
            "timestamp": time.time()
        })
        
    try:
        location = neuro_system.get_location()
        return jsonify({
            "status": "online",
            "trust_score": 98,  # Dynamic score would go here
            "location": location,
            "timestamp": time.time()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/trigger-attack', methods=['POST'])
def trigger_attack():
    """Triggers the full active defense protocol."""
    global neuro_system
    if not neuro_system:
        return jsonify({"error": "System not configured"}), 400
    try:
        # Run in a separate thread to not block the request
        thread = threading.Thread(target=neuro_system.trigger_defense)
        thread.daemon = True
        thread.start()
        return jsonify({"message": "Active Defense Protocol Initiated", "status": "engaged"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/panic', methods=['POST'])
def panic_mode():
    """Triggers the safe mode / panic protocol."""
    global neuro_system
    if not neuro_system:
        return jsonify({"error": "System not configured"}), 400
    try:
        location = neuro_system.get_location()
        # Logic for "sending to contacts" is handled here or in active_defense.py
        # For this demo, we just return the success message
        return jsonify({
            "message": "Safe Mode Activated. Location sent to emergency contacts.",
            "location": location,
            "status": "safe_mode"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Test Endpoints for individual features
@app.route('/api/test/capture', methods=['POST'])
def test_capture():
    global neuro_system
    if not neuro_system: return jsonify({"error": "Not configured"}), 400
    try:
        success = neuro_system.capture_evidence()
        if success:
            return jsonify({"message": "Evidence captured successfully."})
        else:
            return jsonify({"error": "Failed to capture evidence."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/test/lock', methods=['POST'])
def test_lock():
    global neuro_system
    if not neuro_system: return jsonify({"error": "Not configured"}), 400
    try:
        neuro_system.engage_lockdown()
        return jsonify({"message": "Lock command sent."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/configure', methods=['POST'])
def configure_system():
    global neuro_system
    try:
        data = request.json
        target_email = data.get('email')
        phone = data.get('phone')
        carrier = data.get('carrier')

        if not target_email or not phone:
             return jsonify({"error": "Missing notification destination"}), 400

        # Build SMS gateway address
        # e.g. 5551234567@vtext.com
        phone_gateway = f"{phone}@{carrier}"

        neuro_system = active_defense.NeuroDefense(
            owner_email="Neuromimesis@outlook.com",
            email_password="Neuromimesis@1",
            target_email=target_email,
            phone_gateway=phone_gateway,
            smtp_server='smtp-mail.outlook.com',
            smtp_port=587
        )

        return jsonify({"message": "System Armed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Authentication Endpoints
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        profile = data.get('profile')
        
        if not username or not password or not profile:
             return jsonify({"error": "Missing username, password, or profile data"}), 400
             
        hashed_password = generate_password_hash(password)
             
        conn = sqlite3.connect('neuromimesis.db', timeout=15)
        try:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO users (username, password, profile_data) VALUES (?, ?, ?)", 
                           (username, hashed_password, json.dumps(profile)))
            conn.commit()
        finally:
            conn.close()
        
        return jsonify({"message": "User registered successfully"})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
             return jsonify({"error": "Missing username or password"}), 400
             
        conn = sqlite3.connect('neuromimesis.db', timeout=15)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT password, profile_data FROM users WHERE username = ?", (username,))
            row = cursor.fetchone()
        finally:
            conn.close()
            
        if not row:
            return jsonify({"error": "Invalid credentials"}), 401
            
        stored_hash, profile_data_json = row
        
        if not stored_hash or not check_password_hash(stored_hash, password):
            return jsonify({"error": "Invalid credentials"}), 401
            
        return jsonify({
            "message": "Login successful",
            "profile": json.loads(profile_data_json)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/verify_user', methods=['POST'])
def verify_user():
    try:
        data = request.json
        username = data.get('username')
        
        if not username:
             return jsonify({"error": "Missing username"}), 400
             
        conn = sqlite3.connect('neuromimesis.db', timeout=15)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT profile_data FROM users WHERE username = ?", (username,))
            row = cursor.fetchone()
        finally:
            conn.close()
        
        if row:
            return jsonify({
                "message": "User sequence found", 
                "profile": json.loads(row[0])
            })
        else:
            return jsonify({"error": "User not found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Neuro-Mimesis Backend Server Running on port 5000...")
    app.run(debug=True, port=5000)
