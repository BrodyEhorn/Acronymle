from flask import Flask, jsonify
from flask_cors import CORS

import sqlite3
import json
import os

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'acronyms.db')

@app.route('/api/solution', methods=['GET'])
def get_solution():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        # Select a random acronym from the database
        cursor.execute("SELECT words, category FROM acronyms ORDER BY RANDOM() LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        
        if row:
            words = json.loads(row[0])
            category = row[1]
            return jsonify({"words": words, "category": category})
        else:
            return jsonify({"error": "No acronyms found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
