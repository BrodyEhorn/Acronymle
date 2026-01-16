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
        # Specifically select OTW as requested
        cursor.execute("SELECT words FROM acronyms WHERE acronym = 'OTW'")
        row = cursor.fetchone()
        conn.close()
        
        if row:
            words = json.loads(row[0])
            return jsonify({"words": words})
        else:
            return jsonify({"error": "No acronyms found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
