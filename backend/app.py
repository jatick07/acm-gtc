"""Flask backend for "ACM Guess the Output".

Endpoints
    GET  /api/health
    GET  /api/stats
    GET  /api/questions            -> ordered questions + answers (no correctness leak)
    POST /api/questions            -> create {snippet, answers[], correct_index}
    PUT  /api/questions/<id>       -> update
    DELETE /api/questions/<id>     -> delete
    POST /api/answers              -> check answer {question_id, answer_index}
    POST /api/scores               -> submit final score {name, score, correct_count, total_count}
    GET  /api/leaderboard?limit=   -> top scores
    DELETE /api/leaderboard        -> clear leaderboard

Non-API routes are proxied to the built React frontend when present.
"""
from __future__ import annotations

import os

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

import database

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))

app = Flask(__name__)
CORS(app)

database.init_db()


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def _json_body() -> dict:
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        raise ValueError("Request body must be a JSON object.")
    return body


def _require(body: dict, key: str):
    if key not in body or body[key] in (None, ""):
        raise ValueError(f"Missing required field: {key}")
    return body[key]


# --------------------------------------------------------------------------- #
# Health / meta
# --------------------------------------------------------------------------- #
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "acm-guess-the-output"})


@app.route("/api/stats")
def stats():
    questions = database.list_questions()
    return jsonify(
        {
            "question_count": len(questions),
            "score_count": len(database.get_leaderboard(1)),  # cheap count
        }
    )


# --------------------------------------------------------------------------- #
# Questions
# --------------------------------------------------------------------------- #
@app.route("/api/questions", methods=["GET"])
def api_questions():
    return jsonify(database.list_questions())


@app.route("/api/questions", methods=["POST"])
def api_create_question():
    try:
        body = _json_body()
        snippet = _require(body, "snippet")
        answers = _require(body, "answers")
        correct_index = body.get("correct_index", 0)
        difficulty = body.get("difficulty", "low")
        if not isinstance(answers, list) or not all(isinstance(a, str) for a in answers):
            raise ValueError("answers must be a list of strings.")
        if not isinstance(correct_index, int):
            raise ValueError("correct_index must be an integer.")
        qid = database.create_question(snippet, answers, correct_index, difficulty)
        return jsonify({"id": qid, "ok": True}), 201
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@app.route("/api/questions/<int:question_id>", methods=["PUT"])
def api_update_question(question_id: int):
    try:
        body = _json_body()
        snippet = _require(body, "snippet")
        answers = _require(body, "answers")
        correct_index = body.get("correct_index", 0)
        difficulty = body.get("difficulty", "low")
        if not isinstance(answers, list) or not all(isinstance(a, str) for a in answers):
            raise ValueError("answers must be a list of strings.")
        if not isinstance(correct_index, int):
            raise ValueError("correct_index must be an integer.")
        ok = database.update_question(question_id, snippet, answers, correct_index, difficulty)
        if not ok:
            return jsonify({"error": "question not found"}), 404
        return jsonify({"id": question_id, "ok": True})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@app.route("/api/questions/<int:question_id>", methods=["DELETE"])
def api_delete_question(question_id: int):
    ok = database.delete_question(question_id)
    if not ok:
        return jsonify({"error": "question not found"}), 404
    return jsonify({"ok": True})


# --------------------------------------------------------------------------- #
# Gameplay
# --------------------------------------------------------------------------- #
@app.route("/api/answers", methods=["POST"])
def api_answer():
    try:
        body = _json_body()
        question_id = _require(body, "question_id")
        answer_index = _require(body, "answer_index")
        if not isinstance(question_id, int) or not isinstance(answer_index, int):
            raise ValueError("question_id and answer_index must be integers.")
        result = database.check_answer(question_id, answer_index)
        if result is None:
            return jsonify({"error": "question not found"}), 404
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


# --------------------------------------------------------------------------- #
# Scores / leaderboard
# --------------------------------------------------------------------------- #
@app.route("/api/scores", methods=["POST"])
def api_submit_score():
    try:
        body = _json_body()
        player_name = _require(body, "player_name")
        score = body.get("score", 0)
        correct_count = body.get("correct_count", 0)
        total_count = body.get("total_count", 0)
        if not isinstance(player_name, str) or not player_name.strip():
            raise ValueError("player_name must be a non-empty string.")
        database.submit_score(player_name, int(score), int(correct_count), int(total_count))
        return jsonify({"ok": True}), 201
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@app.route("/api/leaderboard", methods=["GET"])
def api_leaderboard():
    limit = request.args.get("limit", 50)
    try:
        limit = min(max(int(limit), 1), 500)
    except (TypeError, ValueError):
        limit = 50
    return jsonify(database.get_leaderboard(limit))


@app.route("/api/leaderboard", methods=["DELETE"])
def api_clear_leaderboard():
    removed = database.clear_leaderboard()
    return jsonify({"ok": True, "removed": removed})


# --------------------------------------------------------------------------- #
# Frontend catch-all (only when a built dist exists)
# --------------------------------------------------------------------------- #
if os.path.isdir(FRONTEND_DIST):

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path: str):
        if path and path.split("/")[0] == "api":
            return jsonify({"error": "use /api for the API"}), 404
        candidate = path or "index.html"
        if os.path.isfile(os.path.join(FRONTEND_DIST, candidate)):
            return send_from_directory(FRONTEND_DIST, candidate)
        # SPA fallback: client-side routes like /questions have no file.
        return send_from_directory(FRONTEND_DIST, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "3000"))
    host = os.environ.get("HOST", "127.0.0.1")
    debug = os.environ.get("DEBUG", "1").strip().lower() in ("1", "true", "yes")
    app.run(host=host, port=port, debug=debug, threaded=True)
