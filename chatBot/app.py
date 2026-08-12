"""
Portfolio Chatbot API — Soumyadipta Seal
------------------------------------------------
Flask app that serves the ML-trained intent-classification chatbot.
Loads model.pkl, vectorizer.pkl, and responses.json (produced by
Portfolio_Chatbot.ipynb) and exposes:

  GET  /            -> minimal built-in chat UI (for quick testing)
  POST /chat         -> JSON API: {"message": "..."} -> {"reply": "...", "intent": "...", "confidence": 0.0}
  GET  /health        -> health check (useful for Render)

Deploy on Render as a Python Web Service:
  Build command: pip install -r requirements.txt
  Start command: gunicorn app:app
"""

import re
import string
import pickle
import json
import os

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow requests from your portfolio website's frontend

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIDENCE_THRESHOLD = 0.28

# ---------------------------------------------------------------------------
# Load trained artifacts
# ---------------------------------------------------------------------------
with open(os.path.join(BASE_DIR, "model.pkl"), "rb") as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, "vectorizer.pkl"), "rb") as f:
    vectorizer = pickle.load(f)

with open(os.path.join(BASE_DIR, "responses.json"), "r") as f:
    responses = json.load(f)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"[%s]" % re.escape(string.punctuation), " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def predict_intent(text: str, threshold: float = CONFIDENCE_THRESHOLD):
    cleaned = clean_text(text)
    vec = vectorizer.transform([cleaned])
    probs = model.predict_proba(vec)[0]
    classes = model.classes_
    best_idx = probs.argmax()
    best_intent = classes[best_idx]
    best_prob = float(probs[best_idx])

    if best_prob < threshold:
        return "fallback", best_prob
    return best_intent, best_prob


def chatbot_reply(user_text: str):
    intent, prob = predict_intent(user_text)
    reply = responses.get(intent, responses["fallback"])
    return reply, intent, prob


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Please provide a 'message' field."}), 400

    reply, intent, confidence = chatbot_reply(user_message)
    return jsonify({
        "reply": reply,
        "intent": intent,
        "confidence": round(confidence, 3)
    })


CHAT_UI = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Soumyadipta Seal — Portfolio Chatbot</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: #0f172a; color: #e2e8f0;
         display: flex; justify-content: center; padding: 40px 16px; margin: 0; }
  .card { width: 100%; max-width: 480px; background: #1e293b; border-radius: 16px; overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
  .header { background: linear-gradient(135deg,#f59e0b,#ea580c); padding: 18px 20px; }
  .header h1 { margin: 0; font-size: 18px; }
  .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
  #log { height: 420px; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .msg { padding: 10px 14px; border-radius: 12px; max-width: 80%; line-height: 1.4; font-size: 14px; white-space: pre-wrap; }
  .user { align-self: flex-end; background: #f59e0b; color: #1e293b; }
  .bot { align-self: flex-start; background: #334155; color: #e2e8f0; }
  form { display: flex; border-top: 1px solid #334155; }
  input { flex: 1; border: none; padding: 14px; background: #0f172a; color: #e2e8f0; font-size: 14px; }
  input:focus { outline: none; }
  button { border: none; background: #f59e0b; color: #1e293b; font-weight: 600; padding: 0 20px; cursor: pointer; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🤖 Soumyadipta's Portfolio Bot</h1>
      <p>Ask me about my skills, projects, experience & more</p>
    </div>
    <div id="log"></div>
    <form id="form">
      <input id="input" autocomplete="off" placeholder="Ask something like 'What are your skills?'" />
      <button type="submit">Send</button>
    </form>
  </div>
<script>
  const log = document.getElementById('log');
  const form = document.getElementById('form');
  const input = document.getElementById('input');

  function addMsg(text, cls) {
    const div = document.createElement('div');
    div.className = 'msg ' + cls;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  addMsg("Hi! I'm Soumyadipta's portfolio chatbot. Ask me about my skills, projects, experience, education, or contact info!", "bot");

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    addMsg(message, 'user');
    input.value = '';
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      addMsg(data.reply || "Sorry, something went wrong.", 'bot');
    } catch (err) {
      addMsg("Network error — please try again.", 'bot');
    }
  });
</script>
</body>
</html>
"""


@app.route("/", methods=["GET"])
def index():
    return render_template_string(CHAT_UI)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
