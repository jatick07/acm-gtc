#!/bin/sh
# Ensure the database exists and is seeded, then start Flask.
set -eu

cd /app/backend
mkdir -p "$(dirname "$QUIZ_DB")"

# Create tables if missing, then load sample questions only if the DB is empty.
python -c "import database; database.init_db()"
python seed.py

exec python app.py
