#!/bin/sh
set -e

if [ "${WAIT_FOR_DB}" = "true" ]; then
  echo "Waiting for database ${DB_HOST:-localhost}:${DB_PORT:-5432}..."
  until nc -z "${DB_HOST:-localhost}" "${DB_PORT:-5432}"; do
    sleep 1
  done
fi

target="$1"

if [ "${RUN_MIGRATIONS}" = "true" ]; then
  if [ -f ./dist/database/run-migrations.js ]; then
    echo "Running database migrations..."
    node ./dist/database/run-migrations.js
  else
    echo "RUN_MIGRATIONS=true but dist/database/run-migrations.js not found; skipping."
  fi
fi

echo "Starting application: $*"
exec "$@"
