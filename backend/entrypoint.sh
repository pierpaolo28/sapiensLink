#!/bin/sh

# Wait for the database to be ready
until pg_isready -h postgresdb -p 5432 -U youruser; do
  echo "Waiting for postgres..."
  sleep 2
done

# Apply database migrations
echo "Apply database migrations"
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

# Start the main process
exec "$@"
