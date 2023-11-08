from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import List

@receiver(pre_delete, sender=List)
def delete_related_topic(sender, instance, **kwargs):
    for topic in instance.topic.all():
        topic.delete()