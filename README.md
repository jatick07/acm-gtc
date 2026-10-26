# ACM — Guess the Output

A quiz app: read a short Python snippet, guess its output, earn points, and climb
the leaderboard. An admin creates and edits questions.

Two apps behind one contract — see [`AGENTS.md`](./AGENTS.md) for architecture,
conventions, and the full runbook.

- **Backend** (`backend/`): Flask + SQLite, pure REST JSON API. Serves the built frontend in production.
- **Frontend** (`frontend/`): React 19 + Vite + Tailwind v4 SPA.

## Run with Docker (single command)

```bash
docker compose up --build
```

Then open <http://localhost:5000>. The frontend is built into the image and served
same-origin by Flask; questions are seeded on first run and saved to a named volume
(`quiz-data`) so they persist across restarts.

## Run locally (manual)

Backend:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python seed.py        # insert sample questions (no-op if the DB already has them)
python app.py         # Flask on http://127.0.0.1:5000
```

Frontend (separate terminal, after `npm install`):

```bash
cd frontend
npm run dev           # Vite on http://127.0.0.1:5173, proxies /api → Flask
```

Production build (served by Flask on one origin):

```bash
cd frontend && npm run build     # → frontend/dist/
cd backend && python app.py
```

## Environment variables

| Var | Default | Where | Purpose |
|---|---|---|---|
| `PORT` | `5000` | `app.py` / compose | HTTP port |
| `HOST` | `127.0.0.1` | `app.py` | Bind address (set `0.0.0.0` for containers) |
| `DEBUG` | `1` (local) / `0` (compose) | `app.py` | Flask debug reloader |
| `QUIZ_DB` | `<backend>/quiz.db` | `database.py` | SQLite path |
