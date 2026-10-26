"""SQLite data-access layer for the Guess the Output game.

All DB access goes through the helpers here so the Flask app stays thin and
every connection shares one lock (the Flask dev server runs threaded).
"""
from __future__ import annotations

import os
import sqlite3
import threading

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("QUIZ_DB", os.path.join(BASE_DIR, "quiz.db"))

_lock = threading.RLock()


def init_db() -> None:
    """Create the database file and tables from schema.sql if missing."""
    schema_path = os.path.join(BASE_DIR, "schema.sql")
    with _lock:
        conn = _connect()
        try:
            with open(schema_path, "r", encoding="utf-8") as fh:
                conn.executescript(fh.read())
            conn.commit()
        finally:
            conn.close()


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


# --------------------------------------------------------------------------- #
# Questions + answers
# --------------------------------------------------------------------------- #
def list_questions() -> list[dict]:
    """All questions with their answers, ordered by sort_order then id."""
    with _lock:
        conn = _connect()
        try:
            rows = conn.execute(
                "SELECT * FROM questions ORDER BY sort_order ASC, id ASC"
            ).fetchall()
            questions = []
            for q in rows:
                answers = conn.execute(
                    "SELECT * FROM answers "
                    "WHERE question_id = ? ORDER BY sort_order ASC, id ASC",
                    (q["id"],),
                ).fetchall()
                questions.append(
                    {
                        "id": q["id"],
                        "difficulty": q["difficulty"],
                        "sort_order": q["sort_order"],
                        "snippet": q["snippet"],
                        "answers": [
                            {
                                "id": a["id"],
                                "text": a["answer_text"],
                                "is_correct": bool(a["is_correct"]),
                                "sort_order": a["sort_order"],
                            }
                            for a in answers
                        ],
                    }
                )
            return questions
        finally:
            conn.close()


def get_question(question_id: int) -> dict | None:
    with _lock:
        conn = _connect()
        try:
            q = conn.execute(
                "SELECT * FROM questions WHERE id = ?", (question_id,)
            ).fetchone()
            if not q:
                return None
            answers = conn.execute(
                "SELECT * FROM answers WHERE question_id = ? ORDER BY sort_order ASC, id ASC",
                (q["id"],),
            ).fetchall()
            return {
                "id": q["id"],
                "sort_order": q["sort_order"],
                "snippet": q["snippet"],
                "created_at": q["created_at"],
                "answers": [
                    {
                        "id": a["id"],
                        "text": a["answer_text"],
                        "is_correct": bool(a["is_correct"]),
                        "sort_order": a["sort_order"],
                    }
                    for a in answers
                ],
            }
        finally:
            conn.close()


def create_question(snippet: str, answers: list[str], correct_index: int, difficulty: str = "low") -> int:
     """Insert a question with its answers. Returns the new question id.

     `answers` is an ordered list of answer strings; `correct_index` is the
     position (into that list) of the correct answer. `difficulty` is one of
     'low', 'medium', 'high'.
     """
     if not answers:
         raise ValueError("A question needs at least one answer option.")
     if not (0 <= correct_index < len(answers)):
         raise ValueError("correct_index out of range.")
     if difficulty not in ("low", "medium", "high"):
         raise ValueError("difficulty must be 'low', 'medium', or 'high'.")

     with _lock:
         conn = _connect()
         try:
             next_id = conn.execute(
                 "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM questions"
             ).fetchone()["next_id"]
             conn.execute(
                 "INSERT INTO questions (id, difficulty, snippet, sort_order) "
                 "VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM questions))",
                 (next_id, difficulty, snippet),
             )
             question_id = next_id
             conn.executemany(
                 "INSERT INTO answers (question_id, answer_text, is_correct, sort_order) "
                 "VALUES (?, ?, ?, ?)",
                 [
                     (question_id, text, 1 if i == correct_index else 0, i)
                     for i, text in enumerate(answers)
                 ],
             )
             conn.commit()
             return question_id
         finally:
             conn.close()


def update_question(question_id: int, snippet: str, answers: list[str], correct_index: int, difficulty: str = "low") -> bool:
    """Replace the snippet and answer set for a question. Returns True if it existed."""
    if not answers:
        raise ValueError("A question needs at least one answer option.")
    if not (0 <= correct_index < len(answers)):
        raise ValueError("correct_index out of range.")
    if difficulty not in ("low", "medium", "high"):
        raise ValueError("difficulty must be 'low', 'medium', or 'high'.")
    with _lock:
        conn = _connect()
        try:
            row = conn.execute(
                "SELECT 1 FROM questions WHERE id = ?", (question_id,)
            ).fetchone()
            if not row:
                return False
            conn.execute("UPDATE questions SET snippet = ?, difficulty = ? WHERE id = ?", (snippet, difficulty, question_id))
            conn.execute("DELETE FROM answers WHERE question_id = ?", (question_id,))
            conn.executemany(
                "INSERT INTO answers (question_id, answer_text, is_correct, sort_order) "
                "VALUES (?, ?, ?, ?)",
                [
                    (question_id, text, 1 if i == correct_index else 0, i)
                    for i, text in enumerate(answers)
                ],
            )
            conn.commit()
            return True
        finally:
            conn.close()


def delete_question(question_id: int) -> bool:
    with _lock:
        conn = _connect()
        try:
            cur = conn.execute("DELETE FROM questions WHERE id = ?", (question_id,))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()


def check_answer(question_id: int, answer_index: int) -> dict | None:
    """Return correctness for a submitted answer index, or None if question missing."""
    with _lock:
        conn = _connect()
        try:
            q = conn.execute(
                "SELECT id FROM questions WHERE id = ?", (question_id,)
            ).fetchone()
            if not q:
                return None
            a = conn.execute(
                "SELECT is_correct FROM answers WHERE question_id = ? AND sort_order = ?",
                (question_id, answer_index),
            ).fetchone()
            if not a:
                return None
            return {"correct": bool(a["is_correct"])}
        finally:
            conn.close()


# --------------------------------------------------------------------------- #
# Scores + leaderboard
# --------------------------------------------------------------------------- #
def submit_score(player_name: str, score: int, correct_count: int, total_count: int) -> int:
    with _lock:
        conn = _connect()
        try:
            cur = conn.execute(
                "INSERT INTO scores (player_name, score, correct_count, total_count) "
                "VALUES (?, ?, ?, ?)",
                (player_name.strip(), score, correct_count, total_count),
            )
            conn.commit()
            return cur.lastrowid
        finally:
            conn.close()


def get_leaderboard(limit: int = 50) -> list[dict]:
    with _lock:
        conn = _connect()
        try:
            rows = conn.execute(
                "SELECT * FROM scores ORDER BY score DESC, id ASC LIMIT ?",
                (limit,),
            ).fetchall()
            return [
                {
                    "id": r["id"],
                    "player_name": r["player_name"],
                    "score": r["score"],
                    "correct_count": r["correct_count"],
                    "total_count": r["total_count"],
                    "created_at": r["created_at"],
                }
                for r in rows
            ]
        finally:
            conn.close()


def clear_leaderboard() -> int:
    with _lock:
        conn = _connect()
        try:
            cur = conn.execute("DELETE FROM scores")
            conn.commit()
            return cur.rowcount
        finally:
            conn.close()
