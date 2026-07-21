#!/usr/bin/env bash
set -euo pipefail

# Trial lifecycle emails (trial_started / day1 / day2 / ending / expired).
# The endpoint is idempotent -- it records a per-kind timestamp column on
# `companies` and skips anything already sent -- so running this daily is
# safe and a missed day self-heals on the next run.

APP_DIR="/var/www/intelligencestest-app"
ENV_FILE="$APP_DIR/.env.local"

if [ ! -r "$ENV_FILE" ]; then
  echo "trial email worker: missing $ENV_FILE" >&2
  exit 1
fi

# Read only CRON_SECRET without executing the environment file as shell code.
CRON_SECRET_VALUE="$(sed -n 's/^CRON_SECRET=//p' "$ENV_FILE" | tail -n 1)"
CRON_SECRET_VALUE="${CRON_SECRET_VALUE#\"}"
CRON_SECRET_VALUE="${CRON_SECRET_VALUE%\"}"
CRON_SECRET_VALUE="${CRON_SECRET_VALUE#\'}"
CRON_SECRET_VALUE="${CRON_SECRET_VALUE%\'}"

if [ -z "$CRON_SECRET_VALUE" ] || [ "$CRON_SECRET_VALUE" = "REPLACE_WITH_LONG_RANDOM_SECRET" ]; then
  echo "trial email worker: CRON_SECRET is not configured" >&2
  exit 1
fi

curl --fail --silent --show-error --max-time 120 \
  --header "Authorization: Bearer $CRON_SECRET_VALUE" \
  "http://127.0.0.1:3000/api/cron/trial-emails"
echo
