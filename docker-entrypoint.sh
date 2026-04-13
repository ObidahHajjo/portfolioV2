#!/bin/sh
set -eu

if [ "${RUN_DB_MIGRATIONS:-false}" = "true" ]; then
  ./node_modules/.bin/prisma migrate deploy
fi

exec "$@"
