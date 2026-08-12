# Soumyadipta Seal — Portfolio Chatbot (ML-powered)

A machine-learning chatbot (TF-IDF + Logistic Regression intent classifier) that answers questions about
Soumyadipta Seal's skills, work experience, projects, education, achievements, certifications, and contact info —
built for embedding in a personal portfolio website.

## Files

| File | Purpose |
|---|---|
| `portfolio_chatbot_data.csv` | Training data: `text,intent` pairs built from the resume |
| `Portfolio_Chatbot.ipynb` | Notebook: loads the CSV, trains + evaluates the model, exports artifacts |
| `model.pkl` | Trained, calibrated Logistic Regression classifier |
| `vectorizer.pkl` | Fitted TF-IDF vectorizer |
| `responses.json` | intent → response text (hand-written from the resume) |
| `app.py` | Flask API (`/chat`) + minimal chat UI (`/`), ready for Render |
| `requirements.txt` | Python dependencies |
| `Procfile` | Tells Render how to start the app (`gunicorn app:app`) |

## Run locally

```bash
pip install -r requirements.txt
python app.py
# open http://localhost:5000
```

## Retrain the model

Open `Portfolio_Chatbot.ipynb` in Jupyter, edit `portfolio_chatbot_data.csv` (add more example phrases / intents)
and/or the `responses` dict, then run all cells. It will regenerate `model.pkl`, `vectorizer.pkl`, and `responses.json`.

## Deploy on Render

1. Push this folder to a GitHub repo, e.g. `https://github.com/sseal2004/portfolio-chatbot`.
2. Go to [render.com](https://render.com) → **New +** → **Web Service** → connect your GitHub repo.
3. Settings:
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
4. Click **Create Web Service**. Render will give you a live URL like `https://portfolio-chatbot.onrender.com`.
5. From your portfolio website's frontend, call the API:

```js
const res = await fetch("https://portfolio-chatbot.onrender.com/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "What are your skills?" })
});
const data = await res.json();
console.log(data.reply);
```

## API

**POST** `/chat`
```json
{ "message": "What projects have you built?" }
```
Response:
```json
{ "reply": "Some of my key projects: ...", "intent": "projects", "confidence": 0.7 }
```

**GET** `/health` → `{"status": "ok"}` (useful for uptime checks)

## Contact

- Email: s.seal.a.b.c@gmail.com
- Phone: +91 7687967008
- GitHub: https://github.com/sseal2004
