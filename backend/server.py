from flask import Flask, jsonify

app = Flask(__name__)

# ✅ Root route to verify backend is running
@app.route('/')
def home():
    return jsonify({"message": "Smart Bin Backend is running successfully!"})

# ✅ Example API endpoint
@app.route('/api/status')
def status():
    return jsonify({"status": "ok", "message": "Server is live"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
