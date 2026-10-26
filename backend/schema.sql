-- Guess the Output — database schema
-- Tables: questions, answers, scores

 CREATE TABLE IF NOT EXISTS questions (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     difficulty  TEXT    NOT NULL DEFAULT 'low',
     sort_order  INTEGER NOT NULL DEFAULT 0,
     snippet     TEXT    NOT NULL,
     created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
 );

CREATE TABLE IF NOT EXISTS answers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    answer_text TEXT    NOT NULL,
    is_correct  INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scores (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name   TEXT    NOT NULL,
    score         INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_count   INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
