#!/usr/bin/env bash
set -e

echo "Starting Online Judge Platform..."

if command -v docker &>/dev/null && [ -f docker-compose.yml ]; then
  echo "Using Docker Compose..."
  docker compose up -d --build
  echo ""
  echo "Services starting:"
  echo "  Frontend:  http://localhost:5173"
  echo "  Backend:   http://localhost:5000"
  echo "  MinIO:     http://localhost:9001 (console)"
  echo ""
  echo "Wait ~15s for services to be ready, then open http://localhost:5173"
else
  echo "Starting locally (requires MongoDB)..."
  (cd backend && npm install && node server.js) &
  (cd frontend && npm install && npm run dev) &
  echo "  Frontend: http://localhost:5173"
  echo "  Backend:  http://localhost:5000"
fi
