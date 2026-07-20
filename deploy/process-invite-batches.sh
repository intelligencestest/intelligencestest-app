#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/intelligencestest-app"
ENV_FILE="$APP_DIR/.env.local"

if [ ! -r "$ENV_FILE" ]; then
  echo "invite batch worker: missing $ENV_FILE" >&2
  exit 1
fi

# Read only CRON_SECRET without executing the environment file as shell code.
CRON_SECRET_VALUE="$(sed -n 's/^CRON_SECRET=//p' "$ENV_FILE" | tail -n 1)"
CRON_SECRET_VALUE="${CRON_SECRET_VALUE#\"}"
CRON_SECRET_VALUE="${CRON_SECRET_VALUE%\"}"
CRON_SECRET_VALUE="${CRON_SECRET_VALUE#\'}"
CRON_SECRET_VALUE="${CRON_SECRET_VALUE%\'}"

if [ -z "$CRON_SECRET_VALUE" ] || [ "$CRON_SECRET_VALUE" = "REPLACE_WITH_LONG_RANDOM_SECRET" ]; then
  echo "invite batch worker: CRON_SECRET is not configured" >&2
  exit 1
fi

curl --fail --silent --show-error --max-time 55 \
  --header "Authorization: Bearer $CRON_SECRET_VALUE" \
  "http://127.0.0.1:3000/api/cron/invite-batches?limit=10"
echo
