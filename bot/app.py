from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os, db

from bot.db import resolve_case

load_dotenv()
api_key = os.environ.get('API_KEY')

app = Flask(__name__)

@app.errorhandler(405)
def  method_not_allowed(e):
    return jsonify({'error': 'Method Not Allowed'}), 405

@app.before_request
def before_request():
    if request.headers.get('key') != api_key:
        return jsonify({'error': 'Invalid API Key'}), 401

@app.get("/api/v1/messages/all")
def get_all_messages():
    return jsonify({"ok": True, "messages": db.get_all(True)})

@app.get("/api/v1/messages/open")
def get_open_messages():
    return jsonify({"ok": True, "messages": db.get_unresolved(True)})

@app.get("/api/v1/messages/closed")
def get_closed_messages():
    return jsonify({"ok": True, "messages": db.get_resolved(True)})
@app.get("/api/v1/users/<user_id>")
def get_by_user(user_id):
    return jsonify({"ok": True, "user": db.get_by_user(user_id, True)})

@app.post("/api/v1/messages/<message_id>/close")
def close_message(message_id):
    resolve_case(message_id)
    return jsonify({"ok": True})
