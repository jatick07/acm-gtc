# syntax=docker/dockerfile:1

# --------------------------------------------------------------------------- #
# Stage 1: build the React/Vite frontend into a static dist/
# --------------------------------------------------------------------------- #
FROM node:22-alpine AS frontend
WORKDIR /app/frontend

# Install dependencies first so this layer caches across source-only changes.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build the production bundle.
COPY frontend/ ./
RUN npm run build

# --------------------------------------------------------------------------- #
# Stage 2: Flask backend that serves the built SPA same-origin
# --------------------------------------------------------------------------- #
FROM python:3.12-alpine

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=5000 \
    HOST=0.0.0.0 \
    DEBUG=0 \
    QUIZ_DB=/app/backend/db/quiz.db

WORKDIR /app/backend
RUN mkdir -p db

# Python runtime deps.
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# App source (includes entrypoint.sh).
COPY backend/ ./
RUN chmod +x entrypoint.sh

# Built frontend, placed where app.py looks for it (../frontend/dist).
COPY --from=frontend /app/frontend/dist ./../frontend/dist

EXPOSE 5000
ENTRYPOINT ["/app/backend/entrypoint.sh"]
