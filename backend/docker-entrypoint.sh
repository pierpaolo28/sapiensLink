#!/bin/bash

# Apply database migrations
python manage.py makemigrations
python manage.py migrate
python manage.py migrate --run-syncdb

# Start the Celery worker and beat processes in the background
celery -A sapiensLink worker -l info &
celery -A sapiensLink beat -l info &

# Start the Django development server
exec "$@"