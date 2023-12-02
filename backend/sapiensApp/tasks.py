# your_app/tasks.py
from celery import shared_task
from django.utils import timezone
from sapiensApp.models import RevokedToken, Notification
from django.conf import settings

@shared_task
def clean_blacklist():
    now = timezone.now() - settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
    expired_tokens = RevokedToken.objects.filter(expiration_date__lt=now)
    expired_tokens.delete()

@shared_task
def delete_read_notifications():
    # Delete read notifications
    Notification.objects.filter(read=True).delete()
