from celery import shared_task
from django.utils import timezone
from sapiensApp.models import RevokedToken, Notification, Rank, RankVote
from django.conf import settings
import json

@shared_task
def clean_blacklist():
    now = timezone.now() - settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
    expired_tokens = RevokedToken.objects.filter(expiration_date__lt=now)
    expired_tokens.delete()

@shared_task
def delete_read_notifications():
    # Delete read notifications
    Notification.objects.filter(read=True).delete()


@shared_task
def delete_elements_from_low_score_ranks():
    # Define the threshold score for individual elements
    threshold_element_score = -15

    # Iterate over all ranks
    for rank in Rank.objects.all():
        # Skip processing if content is None
        if rank.content is None:
            continue

        # Convert the content field to a dictionary if it's a string
        rank_content = rank.content
        if isinstance(rank_content, str):
            rank_content = json.loads(rank_content)

        # Check again if rank_content is None after conversion
        if rank_content is None:
            continue

        # Delete elements from the rank with a score less than -15
        elements_to_delete = [content_index for content_index in rank_content.keys() if calculate_element_score(rank, content_index) < threshold_element_score]

        # Delete the associated votes for the elements
        RankVote.objects.filter(rank=rank, content_index__in=elements_to_delete).delete()

        # Adjust the overall rank score
        rank.score = sum(calculate_element_score(rank, content_index) for content_index in rank_content.keys())

        # Delete the elements from the rank
        for content_index in elements_to_delete:
            del rank_content[content_index]

        # Save the modified content back to the rank
        rank.content = rank_content
        rank.save()

def calculate_element_score(rank, content_index):
    # Calculate the score for a specific element in the rank
    upvotes = RankVote.objects.filter(rank=rank, content_index=content_index, action='upvote').count()
    downvotes = RankVote.objects.filter(rank=rank, content_index=content_index, action='downvote').count()
    return upvotes - downvotes
