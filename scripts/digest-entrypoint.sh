#!/bin/sh
# digest-entrypoint.sh — starts the nightly-digest cron inside the container.
#
# busybox crond does not inherit the container's environment by default,
# so we write the relevant env vars to a file and source it in the cron command.
set -e

LOG_DIR=/var/log/mintymarks
mkdir -p "$LOG_DIR"

# Mark /app as git-safe (mounted volume may be owned by a different UID)
git config --global --add safe.directory /app 2>/dev/null || true

# Belt-and-braces timezone: copy zoneinfo so crond reads the correct wall-clock.
# TZ env var alone is sufficient with tzdata installed, but this ensures /etc/localtime
# is also correct for any tool that ignores TZ.
if [ -f /usr/share/zoneinfo/Europe/London ]; then
  cp /usr/share/zoneinfo/Europe/London /etc/localtime
  echo "Europe/London" > /etc/timezone
fi

# Persist env vars the cron job needs
env | grep -E "^(EMAIL|SMTP|DIGEST|FRONTEND|PAPERCLIP|TZ|NODE_PATH)=" \
  | sed 's/^/export /' > /tmp/digest-env
chmod 600 /tmp/digest-env

# Install crontab: 21:00 Europe/London each night
# TZ=Europe/London in the compose environment makes crond fire at the right wall-clock time.
printf '0 21 * * *\t. /tmp/digest-env; cd /app && node scripts/nightly-digest.mjs >> %s/digest.log 2>&1\n' \
  "$LOG_DIR" | crontab -

echo "[digest-cron] $(date -u +%Y-%m-%dT%H:%M:%SZ) Started. Digest fires daily at 21:00 Europe/London."
echo "[digest-cron] Logs: $LOG_DIR/digest.log"

exec crond -f -l 2
