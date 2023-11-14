# celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab


# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sapiensLink.settings')

# Create a Celery instance and configure it using the settings from Django.
app = Celery('sapiensLink')

# Load task modules from all registered Django app configs.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# Schedule the periodic task
app.conf.beat_schedule = {
    'clean-blacklist': {
        'task': 'sapiensApp.tasks.clean_blacklist',
        'schedule': crontab(hour=0, minute=0), 
    },
    'delete-read-notifications': {
        'task': 'sapiensApp.tasks.delete_read_notifications',
        'schedule': crontab(hour=1, minute=0, day_of_week='monday'),
    },
}