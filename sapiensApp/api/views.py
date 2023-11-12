from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from sapiensApp.models import List, Topic, User, Report, Notification, SavedList, Vote, EditSuggestion, Comment, Feedback, EditComment
from .serializers import ListSerializer, UserSerializer, ReportSerializer, CommentSerializer, EditSuggestionSerializer, SavedListSerializer, EditCommentSerializer, MyUserCreationForm, LoginSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count
from django.db.models import Q
from django.contrib.auth import authenticate, logout
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.views.decorators.csrf import csrf_exempt
from django.utils.http import urlsafe_base64_encode
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.urls import reverse
import app_secrets


LISTS_PER_PAGE = 10

@api_view(['GET'])
def getRoutes(request):
    routes = [
        'GET /api',
        'POST /api/mass-lists/',
        'POST /api/mass-users/',
        'GET-POST-DELETE /api/lists/',
        'GET-PUT-DELETE /api/list/:id',
        'GET-POST-DELETE /api/users/',
        'GET-PUT-DELETE /api/user/:id/',
        'GET-POST-DELETE /api/reports/',
        'GET-PUT-DELETE /api/report/:id/',
        'GET /api/notifications/',
        'GET /api/notifications/<int:notification_id>/mark_as_read/',
        'GET /api/token/',
        'GET /api/token/refresh/',
        'GET /api/get_home_lists/',
        'GET /api/get_list/',
        'POST /api/vote/:pk/:action/',
        'GET-POST /api/user_profile/:pk/',
        'GET-POST /api/private_lists/:pk',
        'DELETE /api/delete_comment/:pk',
        'GET /api/topics_page/',
        'GET /api/who_to_follow_page/',
        'POST /api/delete_account/',
        'GET-POST /api/list_pr/:pk/',
        'POST /api/approve_suggestion/:suggestion_id/',
        'POST /api/decline_suggestion/:suggestion_id/',
        'DELETE /api/delete_pr_comment/:comment_id/',
        'GET /api/saved_lists/:pk/',
        'POST /api/register/',
        'POST /api/reset_password/',
        'POST /api/reset_password_confirm/:uidb64/:token/',
        'POST /api/login_user/',
        'POST /api/logout_user'
    ]
    return Response(routes)


@api_view(['POST'])
def mass_list_upload(request):
    serializer = ListSerializer(data=request.data, many=True)

    if serializer.is_valid():
        serializer.save()

        return Response({"outcome": "successful upload"}, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST', 'DELETE'])
def lists(request):
    """
    Retrieve/delete lists or make one.
    """

    if request.method == 'GET':
        paginator = PageNumberPagination()
        paginator.page_size = LISTS_PER_PAGE  # Set the number of items per page

        lists = List.objects.all()
        paginated_queryset = paginator.paginate_queryset(lists, request)
        serializer = ListSerializer(paginated_queryset, many=True)
        
        return paginator.get_paginated_response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ListSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"outcome": "successful upload"}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        lists = List.objects.all()
        lists.delete()
        return Response({"outcome": "all lists deleted"}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
def list(request, pk):
    """
    Retrieve, update or delete a list.
    """
    try:
        list = List.objects.get(id=pk)
    except List.DoesNotExist:
        return Response({"outcome": "list not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ListSerializer(list, many=False)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ListSerializer(list, data=request.data, many=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        list.delete()
        return Response({"outcome": "list deleted"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_home_lists(request):
    q = request.GET.get('q', '')
    # TODO: Follow home sorting should be made visible to just logged in users on the front end
    follow = request.GET.get('follow', 'follow_false')
    top_voted = request.GET.get('top_voted', 'top_voted_false')

    all_lists = List.objects.filter(public=True).distinct()
    all_list_count = all_lists.count()
    all_topics = Topic.objects.filter(name__icontains=q)
    topics = [topic for topic in all_topics if all_lists.filter(topic=topic).exists()]
    topic_counts = {topic.name: all_lists.filter(topic=topic).count() for topic in topics}
    filtered_topic_counts = {key: topic_counts[key] for key in topic_counts if key in [topic.name for topic in topics]}
    sorted_topic_counts = sorted(filtered_topic_counts.items(), key=lambda item: item[1], reverse=True)

    lists = all_lists.filter(
        Q(topic__name__icontains=q) |
        Q(name__icontains=q) |
        Q(content__icontains=q)
    )

    users = User.objects.annotate(followers_count=Count('followers')).order_by('-followers_count')[0:5]
    list_count = lists.count()

    if follow == 'follow_true':
        f_list = request.user.following.all()
        lists = lists.filter(author__in=f_list)
        list_count = lists.count()
    elif top_voted == 'top_voted_true':
        lists = lists.order_by('-score')

    
    # Serialize the data
    paginator = PageNumberPagination()
    paginator.page_size = LISTS_PER_PAGE
    paginated_queryset = paginator.paginate_queryset(lists, request)
    list_serializer = ListSerializer(paginated_queryset, many=True)
    user_serializer = UserSerializer(users, many=True)

    # Construct the response JSON
    response_data = {
        'pagination': {
            'next_page': paginator.get_next_link(),
            'previous_page': paginator.get_previous_link(),
            'total_pages': paginator.page.paginator.num_pages,
            'current_page': paginator.page.number,
        },
        'lists': list_serializer.data,
        'users': user_serializer.data,
        'list_count': list_count,
        'topic_counts': sorted_topic_counts,
        'all_list_count': all_list_count,
    }

    return Response(response_data, status=status.HTTP_200_OK)



@api_view(['GET', 'POST'])
def get_list(request, pk):
    list_instance = List.objects.get(id=pk)

    list_comments = list_instance.comment_set.all()
    participants = list_instance.participants.all()

    user = request.user
    has_reported = False
    saved_list_ids = []

    if user.is_authenticated:
        has_reported = Report.objects.filter(user=user, list=list_instance).exists()
        saved_list_ids = SavedList.objects.filter(user=user).values_list('list_id', flat=True)

    # TODO: the comment button should be hidden on the user interface if the user is not logged in
    if request.method == 'POST':
        if 'comment' in request.data:
            comment_serializer = CommentSerializer(data=request.data['comment'])
            if comment_serializer.is_valid():
                comment = comment_serializer.save(user=user, list=list_instance)
                list_instance.participants.add(user)

                # Sending notification to the WebSocket group
                channel_layer = get_channel_layer()
                for receiver in list_instance.participants.all():
                    if receiver != request.user:
                        async_to_sync(channel_layer.group_send)(
                            'notifications_group',
                            {
                                'type': 'send_notification',
                                'notification': f'A new comment was added on the list "{list_instance.name}".',
                                'creator_id': user.id,
                                'receiver_id': receiver.id,
                                'url': request.path.split('/')[0] + '/list/' + str(list_instance.id)
                            }
                        )

                # Serialize the updated list data
                list_serializer = ListSerializer(list_instance)
                return Response(list_serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(comment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif 'save' in request.data:
            SavedList.objects.get_or_create(user=user, list=list_instance)
            return Response({'message': 'List saved successfully'}, status=status.HTTP_200_OK)

        elif 'unsave' in request.data:
            saved_list = get_object_or_404(SavedList, user=user, list=list_instance)
            saved_list.delete()
            return Response({'message': 'List unsaved successfully'}, status=status.HTTP_200_OK)

    list_serializer = ListSerializer(list_instance)
    context = {
        'list': list_serializer.data,
        'list_comments': CommentSerializer(list_comments, many=True).data,
        'participants': UserSerializer(participants, many=True).data,
        'has_reported': has_reported,
        'saved_list_ids': saved_list_ids
    }

    return Response(context)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote(request, pk, action):
    list_instance = get_object_or_404(List, pk=pk)
    user = request.user

    try:
        vote = Vote.objects.get(user=user, list=list_instance)
        if vote.action == action:
            return Response({'detail': f'Already {action}d'}, status=status.HTTP_400_BAD_REQUEST)
        elif vote.action == 'upvote' or vote.action == 'downvote':
            vote.action = 'neutral'
            vote.save()
        else:
            vote.action = action
            vote.save()
    except Vote.DoesNotExist:
        if action in ('upvote', 'downvote'):
            Vote.objects.create(user=user, list=list_instance, action=action)

    if action == 'upvote':
        list_instance.score += 1
    elif action == 'downvote':
        list_instance.score -= 1

    list_instance.save()

    # Serialize the updated list data
    list_serializer = ListSerializer(list_instance)
    return Response(list_serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_profile(request, pk):
    user_instance = get_object_or_404(User, pk=pk)
    lists_count = List.objects.filter(author_id=pk, public=True).count()
    lists = user_instance.list_set.filter(public=True)
    saved_lists = SavedList.objects.filter(user=user_instance)
    contributions = EditSuggestion.objects.filter(suggested_by=pk, is_accepted=True).order_by('-id')[:5]

    paginator = PageNumberPagination()
    paginator.page_size = LISTS_PER_PAGE
    paginated_queryset = paginator.paginate_queryset(lists, request)

    is_following = request.user.following.filter(pk=pk).exists() if request.user.is_authenticated else False

    if request.method == "POST":
        current_user_profile = request.user
        if pk != request.user.id:
            if request.user.following.filter(pk=pk).exists():
                current_user_profile.following.remove(user_instance)
                is_following = False
            else:
                current_user_profile.following.add(user_instance)
                is_following = True
            current_user_profile.save()

    # Serialize the data
    list_serializer = ListSerializer(paginated_queryset, many=True)
    contributions_serializer = EditSuggestionSerializer(contributions, many=True)
    user_serializer = UserSerializer(user_instance)
    saved_lists_serializer = SavedListSerializer(saved_lists, many=True)

    context = {
        'pagination': {
            'next_page': paginator.get_next_link(),
            'previous_page': paginator.get_previous_link(),
            'total_pages': paginator.page.paginator.num_pages,
            'current_page': paginator.page.number,
        },
        'lists': list_serializer.data,
        "user": user_serializer.data,
        "lists_count": lists_count,
        'is_following': is_following,
        'saved_lists': saved_lists_serializer.data,
        'contributions': contributions_serializer.data,
    }

    return Response(context, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def private_lists(request, pk):
    user_instance = get_object_or_404(User, pk=pk)
    lists_count = List.objects.filter(author_id=pk, public=True).count()
    private_lists = user_instance.list_set.filter(public=False)
    saved_lists = SavedList.objects.filter(user=user_instance)

    paginator = PageNumberPagination()
    paginator.page_size = LISTS_PER_PAGE
    paginated_queryset = paginator.paginate_queryset(private_lists, request)

    is_following = request.user.following.filter(pk=pk).exists() if request.user.is_authenticated else False

    if request.method == "POST":
        current_user_profile = request.user
        if pk != request.user.id:
            if request.user.following.filter(pk=pk).exists():
                current_user_profile.following.remove(user_instance)
                is_following = False
            else:
                current_user_profile.following.add(user_instance)
                is_following = True
            current_user_profile.save()

    # Serialize the data
    list_serializer = ListSerializer(paginated_queryset, many=True)
    user_serializer = UserSerializer(user_instance)
    saved_lists_serializer = SavedListSerializer(saved_lists, many=True)

    context = {
        'pagination': {
            'next_page': paginator.get_next_link(),
            'previous_page': paginator.get_previous_link(),
            'total_pages': paginator.page.paginator.num_pages,
            'current_page': paginator.page.number,
        },
        'lists': list_serializer.data,
        "user": user_serializer.data,
        "lists_count": lists_count,
        'is_following': is_following,
        'saved_lists': saved_lists_serializer.data
    }

    return Response(context, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, pk):
    comment = get_object_or_404(Comment, pk=pk)

    # Check if the authenticated user is the owner of the comment
    if request.user != comment.user:
        return Response({'detail': 'Not authorized to proceed.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        comment.delete()
        return Response({'detail': 'Comment deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

    return Response({'detail': 'Invalid request.'}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def topics_page(request):
    q = request.GET.get('q') if request.GET.get('q') else ''
    
    all_lists = List.objects.filter(public=True)
    all_topics = Topic.objects.filter(name__icontains=q)
    all_list_count = all_lists.count()
    
    # Filtering the topics where public=True at least once
    topics = [topic for topic in all_topics if all_lists.filter(topic=topic).exists()]

    # Creating the topic counts dictionary for the filtered topics
    topic_counts = {topic.name: all_lists.filter(topic=topic).count() for topic in topics}

    filtered_topic_counts = {key: topic_counts[key] for key in topic_counts if key in [topic.name for topic in topics]}

    sorted_topic_counts = sorted(filtered_topic_counts.items(), key=lambda item: item[1], reverse=True)

    response_data = {
        'topic_counts': sorted_topic_counts,
        'all_list_count': all_list_count
    }

    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
def who_to_follow_page(request):
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    users = User.objects.filter(name__icontains=q).annotate(followers_count=Count('followers')).order_by('-followers_count')
    user_serializer = UserSerializer(users, many=True)
    return Response({'users': user_serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
def mass_users_upload(request):
    serializer = UserSerializer(data=request.data, many=True)

    if serializer.is_valid():
        serializer.save()

        return Response({"outcome": "successful upload"}, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST', 'DELETE'])
def users(request):
    """
    Retrieve/delete users or make one.
    """

    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data, many=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        users = User.objects.all()
        users.delete()
        return Response({"outcome": "users deleted"}, status=status.HTTP_204_NO_CONTENT)
    

@api_view(['GET', 'PUT', 'DELETE'])
def user(request, pk):
    """
    Retrieve, update or delete a user.
    """
    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, many=False, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response({"outcome": "user deleted"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST', 'DELETE'])
def reports(request):
    """
    Retrieve/delete reports or make one.
    """

    if request.method == 'GET':
        reports = Report.objects.all()
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ReportSerializer(data=request.data, many=False)
        list = get_object_or_404(List, id=request.data['list'])
        if serializer.is_valid():
            serializer.save()
            # Sending notification to the WebSocket group
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "notifications_group",
                {
                    'type': 'send_notification',
                    'notification': f'Your list "{list.name}" has been reported by an user.',
                    'creator_id': request.user.id,
                    'receiver_id': list.author.id,
                    'url': request.build_absolute_uri('/') + 'list/' + str(list.id) + '/',
                }
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        reports.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

@api_view(['GET', 'DELETE'])
def report(request, pk):
    """
    Retrieve or delete a report.
    """
    try:
        report = Report.objects.get(id=pk)
    except Report.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ReportSerializer(report, many=False)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    password = request.data.get('password')
    confirm_delete = request.data.get('confirm_delete')
    feedback = request.data.get('feedback')

    Feedback.objects.create(feedback=feedback)

    user = authenticate(request, email=request.user.email, password=password)

    if user is not None and confirm_delete == 'on':
        # Delete the user account
        user.delete()
        logout(request)
        return Response({'message': 'Your account has been deleted.'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid password or confirmation.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_pr(request, pk):
    list_instance = get_object_or_404(List, id=pk)
    suggestions = EditSuggestion.objects.filter(list=list_instance, is_accepted=False)
    pr_comments = EditComment.objects.filter(edit_suggestion__list=list_instance)

    if request.method == 'GET':
        list_serializer = ListSerializer(list_instance)
        suggestions_serializer = EditSuggestionSerializer(suggestions, many=True)
        comments_serializer = EditCommentSerializer(pr_comments, many=True)
        return Response({'list': list_serializer.data, 'suggestions': suggestions_serializer.data, 'pr_comments': comments_serializer.data})

    elif request.method == 'POST':
        if 'edit_suggestion' in request.data:
            edit_suggestion_serializer = EditSuggestionSerializer(data=request.data['edit_suggestion'])
            if edit_suggestion_serializer.is_valid():
                suggestion = edit_suggestion_serializer.save(list=list_instance, suggested_by=request.user)
                # Sending notification to the WebSocket group (sample code)
                if list_instance.author:
                    # TODO: If a list has no author notify admin users instead of no notification
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        "notifications_group",
                        {
                            'type': 'send_notification',
                            'notification': f'A new suggestion to edit your list "{list_instance.name}" has been created.',
                            'creator_id': request.user.id,
                            'receiver_id': list_instance.author.id,
                            'url': request.build_absolute_uri('/') + 'list_pr/' + str(list_instance.id) + '/',
                        }
                    )
                return Response({'message': 'Edit suggestion created successfully'}, status=status.HTTP_201_CREATED)
            else:
                return Response(edit_suggestion_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif 'comment' in request.data:
            comment_serializer = EditCommentSerializer(data=request.data['comment'])
            if comment_serializer.is_valid():
                comment = comment_serializer.save(commenter=request.user, edit_suggestion_id=request.data['comment']['edit_suggestion'])
                # Sending notification to the WebSocket group (sample code)
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "notifications_group",
                    {
                        'type': 'send_notification',
                        'notification': f'A new comment has been added to a suggestion to edit your list "{list_instance.name}".',
                        'creator_id': request.user.id,
                        'receiver_id': list_instance.author.id,
                        'url': request.build_absolute_uri('/') + 'list_pr/' + str(list_instance.id) + '/',
                    }
                )
                return Response({'message': 'Comment added successfully'}, status=status.HTTP_201_CREATED)
            else:
                return Response(comment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_suggestion(request, suggestion_id):
    suggestion = get_object_or_404(EditSuggestion, id=suggestion_id)

    # Check if the current user is the author of the list or a superuser
    if suggestion.list.author == request.user or request.user.is_superuser:
        suggestion.is_accepted = True
        suggestion.save()

        list_instance = suggestion.list
        list_instance.content = suggestion.suggestion_text
        list_instance.save()

        # Sending notification to the WebSocket group (sample code)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notifications_group",
            {
                'type': 'send_notification',
                'notification': f'Your suggestion to edit the list "{list_instance.name}" has been approved!',
                'creator_id': request.user.id,
                'receiver_id': suggestion.suggested_by.id,
                'url': request.build_absolute_uri('/') + 'list/' + str(list_instance.id) + '/',
            }
        )

        return Response({'message': 'Suggestion approved successfully'}, status=status.HTTP_200_OK)

    return Response({'message': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_suggestion(request, suggestion_id):
    suggestion = get_object_or_404(EditSuggestion, id=suggestion_id)

    # Check if the current user is the author of the list or a superuser
    if suggestion.list.author == request.user or request.user.is_superuser:
        list_id = suggestion.list.id
        suggestion.delete()

        # Sending notification to the WebSocket group (sample code)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notifications_group",
            {
                'type': 'send_notification',
                'notification': f'Your suggestion to edit the list "{suggestion.list.name}" has been declined.',
                'creator_id': request.user.id,
                'receiver_id': suggestion.suggested_by.id,
                'url': request.build_absolute_uri('/') + 'list/' + str(list_id) + '/',
            }
        )

        return Response({'message': 'Suggestion declined successfully'}, status=status.HTTP_200_OK)

    return Response({'message': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_pr_comment(request, comment_id):
    comment = get_object_or_404(EditComment, id=comment_id)

    # Check if the current user is the author of the comment
    if comment.commenter == request.user:
        comment.delete()
        return Response({'message': 'Comment deleted successfully'}, status=status.HTTP_200_OK)

    return Response({'message': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
def saved_lists(request, pk):
    q = request.GET.get('q', '')
    user_saved_lists = SavedList.objects.filter(user__id=pk, list__name__icontains=q)
    serializer = SavedListSerializer(user_saved_lists, many=True)
    return Response(serializer.data)


@api_view(['GET'])
# In order to work with this view the user needs to be logged in and the access token needs to be passed in Authorization as Bearer
@authentication_classes([JWTAuthentication])  # Use JSONWebTokenAuthentication for secure authentication
@permission_classes([IsAuthenticated])  # Ensure that the user is authenticated
def get_notifications(request):
    limit = int(request.GET.get('limit', 5))  # Convert to an integer and default to 5 if limit is not provided
    notifications = Notification.objects.all().filter(read=False).filter(receiver=request.user.id).filter(~Q(creator=request.user.id))[:limit]
    notifications_data = [{'message': notification.message,
                           'id': notification.id,
                           'read': notification.read,
                           'url': notification.url} for notification in notifications]
    return JsonResponse({'notifications': notifications_data})


@api_view(['POST'])
@authentication_classes([JWTAuthentication])  # Use JSONWebTokenAuthentication for secure authentication
@permission_classes([IsAuthenticated])  # Ensure that the user is authenticated
def mark_notification_as_read(request, notification_id):
    try:
        notification = Notification.objects.get(pk=notification_id)
        notification.read = True
        notification.save()
        return JsonResponse({'status': 'Notification marked as read.'})
    except Notification.DoesNotExist:
        return JsonResponse({'error': 'Notification not found.'}, status=404)
    

@api_view(['POST'])
def register(request):
    form = MyUserCreationForm(request.data)

    if form.is_valid():
        user = form.save(commit=False)
        user.email = user.email.lower()
        user.save()

        login(request, user)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        data = {
            "access_token": access_token,
            "refresh_token": str(refresh),
            "expiration_time": refresh.access_token['exp'] * 1000  # Convert expiration time to milliseconds
        }

        return Response(data, status=status.HTTP_201_CREATED)
    else:
        return Response({"error": "An error occurred during registration"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])  # Use JSONWebTokenAuthentication for secure authentication
@permission_classes([IsAuthenticated])  # Ensure that the user is authenticated
def password_reset(request):
    email = request.data.get('email', '')
    try:
        user = User.objects.get(email=email)
        context = {
            'email': email,
            'user': user,
            'domain': request.META['HTTP_HOST'],
            'site_name': 'SapiensLink',
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': default_token_generator.make_token(user),
            'protocol': 'https' if request.is_secure() else 'http',
        }
        reset_url = reverse('password_reset_confirm', kwargs={'uidb64': context['uid'], 'token': context['token']})
        reset_url = f"{context['protocol']}://{context['domain']}{reset_url}"
        context['reset_url'] = reset_url

        # Send email using SendGrid
        message = Mail(
            from_email=app_secrets.FROM_EMAIL,  # Replace with your email
            to_emails=[email],
            subject='Password Reset',
            html_content=f'Click the following link to reset your password: {reset_url}',
        )
        sg = SendGridAPIClient(app_secrets.SENDGRID_API_KEY)  # Replace with your SendGrid API key
        sg.send(message)

        return Response({'detail': 'Password reset email sent.'}, status=status.HTTP_200_OK)
    except ObjectDoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@csrf_exempt
def password_reset_confirm(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        
        new_password = request.data.get('new_password', '')
        # Validate the new password
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            # Handle password reset confirmation logic here
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Password reset successful.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
    except ObjectDoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError:
        return Response({'error': 'Invalid user ID.'}, status=status.HTTP_400_BAD_REQUEST)
    


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):

    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        # Manually authenticate the user using the authenticate function
        user = authenticate(request=request, username=email, password=password)

        if user is not None:
            # Use DRF's login function to log in the user
            login(request, user)
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            # Return JSON response
            response_data = {
                'access_token': access_token,
                'refresh_token': str(refresh),
                'expiration_time': refresh.access_token['exp'] * 1000  # Convert expiration time to milliseconds
            }

            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Email or password does not exist'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({'error': 'Invalid input'}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):

    # Clear session data
    request.session.pop("access_token", None)
    request.session.pop("refresh_token", None)
    request.session.pop("expiration_time", None)

    logout(request)
    return Response({'detail': 'Logout successful'}, status=status.HTTP_200_OK)