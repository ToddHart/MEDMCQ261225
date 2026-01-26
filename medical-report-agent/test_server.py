#!/usr/bin/env python3
"""
Simple Flask Test - Verify server can start
"""

from flask import Flask
import webbrowser
import threading
import time

app = Flask(__name__)

@app.route('/')
def index():
    return """
    <html>
    <head><title>Medical Report Agent - Test</title></head>
    <body style="background: #0f0f23; color: white; font-family: Arial; text-align: center; padding: 50px;">
        <h1>🎉 Success!</h1>
        <h2>The server is working!</h2>
        <p>If you see this, Flask is running correctly.</p>
        <p><a href="/test" style="color: #4facfe;">Click here to test the full app</a></p>
    </body>
    </html>
    """

@app.route('/test')
def test():
    return """
    <html>
    <body style="background: #0f0f23; color: white; font-family: Arial; padding: 50px;">
        <h1>✅ Server Test Successful</h1>
        <p>Flask is working properly. Now we can load the full interface.</p>
    </body>
    </html>
    """

def open_browser():
    time.sleep(2)
    webbrowser.open('http://127.0.0.1:5000')

if __name__ == '__main__':
    print("="*60)
    print("Medical Report Agent - Server Test")
    print("="*60)
    print()
    print("Starting server on http://127.0.0.1:5000")
    print()

    # Open browser
    threading.Thread(target=open_browser, daemon=True).start()

    # Run Flask
    app.run(host='127.0.0.1', port=5000, debug=False)
