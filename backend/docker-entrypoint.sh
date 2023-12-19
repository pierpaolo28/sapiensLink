#!/bin/bash
set -e

# Set the user
user="docker_user"

# Create a user and set permissions
useradd -m -u 1000 $user
chown -R $user:$user /app

export DJANGO_SETTINGS_MODULE=sapiensLink.settings

# Wait for the PostgreSQL service to be available
/app/wait-for-it.sh postgres:5432 --timeout=30

# Apply database migrations
gosu $user python manage.py makemigrations
gosu $user python manage.py migrate
gosu $user python manage.py migrate auth

# Add a delay before starting Celery to ensure other services are initialized
sleep 10

# Start the Celery worker and beat processes in the background
gosu $user celery -A sapiensLink worker -l info &
gosu $user celery -A sapiensLink beat -l info &

# Start the Django development server
exec gosu $user "$@"
