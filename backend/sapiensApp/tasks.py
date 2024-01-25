from celery import shared_task
from django.utils import timezone
from sapiensApp.models import RevokedToken, Notification, Rank, RankVote, User, List
from django.conf import settings
from django.db.models import IntegerField
from django.db.models.functions import Cast
from django.db.models import Subquery
import json
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import app_secrets
import markdown
from django.urls import reverse


# TODO: Update Domain
DOMAIN = 'http://127.0.0.1:8000'

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


@shared_task
def send_inactive_user_notifications():
    # Define the threshold for "recently"
    threshold_date = timezone.now() - timezone.timedelta(days=14)

    # Get inactive users
    inactive_users = User.objects.filter(last_login__lt=threshold_date)

    # Get latest posts
    latest_lists = List.objects.order_by('-created')[:5]
    latest_ranks = Rank.objects.order_by('-created')[:5]
    lists_html = "\n".join([f"<li><a href='{DOMAIN}/list/{post.id}'>{markdown.markdown(post.name)}</a></li>" for post in latest_lists])
    ranks_html = "\n".join([f"<li><a href='{DOMAIN}/rank/{post.id}'>{markdown.markdown(post.name)}</a></li>" for post in latest_ranks])

    # Send email to each inactive user
    for user in inactive_users:
        if user.email_subscription.receive_inactive_user_notifications:
            unsubscribe_url = f"{DOMAIN}/signin?inactive=True"

            # Construct the email using SendGrid
            message = Mail(
                from_email=app_secrets.FROM_EMAIL,
                to_emails=user.email,
                subject='Latest from SapiensLink',
                html_content=f'''
                    <p>Dear {user.username},</p>
                    <p>Check out the latest posts on SapiensLink:</p>
                    <p>Lists</p>
                    <ul>
                        {lists_html}
                    </ul>
                    <p>Ranks</p>
                    <ul>
                        {ranks_html}
                    </ul>
                    <p>To stop getting reminders about new content on SapiensLink, click <a href="{unsubscribe_url}">here</a>.</p>
                '''
            )

            try:
                sg = SendGridAPIClient(app_secrets.SENDGRID_API_KEY)
                sg.send(message)
            except Exception as e:
                print(f"Error sending email to {user.email}: {str(e)}")


@shared_task
def send_unread_notification_reminders():
    # Define the threshold for unread notifications
    threshold_date = timezone.now() - timezone.timedelta(days=7)

    # Get distinct user IDs from the Notification model
    distinct_user_ids = Notification.objects.filter(
        read=False,
        timestamp__lt=threshold_date,
    ).values('receiver').distinct()

    # Ensure distinct_user_ids are cast to integer
    casted_user_ids = distinct_user_ids.annotate(
        user_id_as_integer=Cast('receiver', IntegerField())
    ).values('user_id_as_integer').distinct()

    # Use the casted_user_ids in the User query
    users_with_unread_notifications = User.objects.filter(
        id__in=Subquery(casted_user_ids)
    )

    # Send email to each user with unread notifications
    for user in users_with_unread_notifications:
        if user.email_subscription.receive_unread_notification_reminders:
            unsubscribe_url = f"{DOMAIN}/signin?unread=True"

            unread_notifications = Notification.objects.filter(
                receiver=user.id,
                read=False,
                timestamp__lt=threshold_date
            )

            # Convert unread notifications to HTML using Markdown
            notifications_html = "\n".join([f"<li><a href='{notification.url}'>{markdown.markdown(notification.message)}</a></li>" for notification in unread_notifications])

            # Construct the email using SendGrid
            html_content = f'''
            <p>Dear {user.username},</p>
            <p>You have unread notifications:</p>
            <ul>
                {notifications_html}
            </ul>
            <p>To stop getting reminders about unread notifications, click <a href="{unsubscribe_url}">here</a>.</p>
            '''

            message = Mail(
                from_email=app_secrets.FROM_EMAIL,
                to_emails=user.email,
                subject='SapiensLink Unread Notifications Reminder',
                html_content=html_content,
            )

            try:
                sg = SendGridAPIClient(app_secrets.SENDGRID_API_KEY)
                sg.send(message)
            except Exception as e:
                print(f"Error sending email to {user.email}: {str(e)}")
