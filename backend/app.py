from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/solution', methods=['GET'])
def get_solution():
    return jsonify({"words": ["on", "the", "way"]})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
