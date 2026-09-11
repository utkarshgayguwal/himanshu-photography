#!/bin/sh
set -e

echo "Waiting for database and applying migrations..."
until python manage.py migrate --noinput; do
  sleep 2
done

python manage.py seed_content
python manage.py collectstatic --noinput

exec "$@"
