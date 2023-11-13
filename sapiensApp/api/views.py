from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from sapiensApp.models import List, Topic, User, Report, Notification, SavedList, Vote, EditSuggestion, Comment, Feedback, EditComment
from .serializers import ListSerializer, UserSerializer, ReportSerializer, CommentSerializer, EditSuggestionSerializer, SavedListSerializer, EditCommentSerializer, MyUserCreationForm, LoginSerializer, RegisterSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
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
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


LISTS_PER_PAGE = 10

@api_view(['GET'])
def getRoutes(request):
    routes = [
        'GET /api/',
        'POST /api/login_user/',
        'POST /api/logout_user/',
        'POST /api/register_user/',
        'GET /api/token/',
        'GET /api/token/refresh/',
        'POST /api/password_reset/',
        'POST /api/password_reset_confirm/:uidb64/:token/',
        'GET-POST /api/user_profile_page/:pk/',
        'GET-PUT /api/update_user_page/',
        'POST /api/delete_user_page/',
        'GET /api/home_page/',
        'GET /api/topics_page/',
        'GET /api/who_to_follow_page/',
        'POST /api/create_list_page/',
        'GET-POST /api/list_page/:pk/',
        'DELETE /api/delete_comment_action/:pk/',
        'GET-PUT-POST /api/update_list_page/',
        'GET-POST /api/list_pr_page/:pk/',
        'POST /api/approve_suggestion_action/:suggestion_id/',
        'POST /api/decline_suggestion_action/:suggestion_id/',
        'DELETE /api/delete_pr_comment_action/:comment_id/',
        'GET-POST /api/private_lists_page/:pk/',
        'GET /api/saved_lists_page/:pk/',
        'POST /api/report_list_page/:pk/',
        'POST /api/vote_action/:pk/:action/',
        'GET /api/notifications/',
        'GET /api/notifications/<int:notification_id>/mark_as_read/',
        'GET /api/swagger/',
        'GET /api/redoc/'
        'GET-POST-DELETE /api/lists_db_setup/',
        'GET-POST-DELETE /api/users_db_setup/',
    ]
    return Response(routes)


# Web Application Utils

@swagger_auto_schema(
    method='post',
    operation_summary='Logging in users',
    request_body=LoginSerializer,
    responses={
        200: openapi.Response(
            description='Successful login',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'access_token': openapi.Schema(type=openapi.TYPE_STRING),
                    'refresh_token': openapi.Schema(type=openapi.TYPE_STRING),
                    'expiration_time': openapi.Schema(type=openapi.TYPE_INTEGER),
                },
            ),
        ),
        400: 'Bad Request - Both Email and Password are required',
        401: 'Unauthorized - Wrong Password',
    }
)
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
            return Response({'message': 'Email does not exist'}, status=status.HTTP_400_BAD_REQUEST)

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
            return Response({'message': 'Wrong Password'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({'message': 'Both Email and Password are required'}, status=status.HTTP_400_BAD_REQUEST)
    

@swagger_auto_schema(
    method='post',
    operation_summary='Logging out users',
    responses={
        200: openapi.Response(
            description='Logout successful',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
        ),
    }
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def logout_user(request):
    # TODO: on frontend when users logs out tokens are deleted and blacklisted so 
    # people can't use them before the expire

    # Clear session data
    request.session.pop("access_token", None)
    request.session.pop("refresh_token", None)
    request.session.pop("expiration_time", None)

    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='post',
    operation_summary='User registration',
    request_body=RegisterSerializer,
    responses={
        201: openapi.Response(
            description='User registered successfully',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'access_token': openapi.Schema(type=openapi.TYPE_STRING),
                    'refresh_token': openapi.Schema(type=openapi.TYPE_STRING),
                    'expiration_time': openapi.Schema(type=openapi.TYPE_INTEGER),
                },
            ),
        ),
        400: 'Bad Request - An error occurred during registration',
    }
)
@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = MyUserCreationForm(serializer.validated_data).save(commit=False)
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
        # TODO: provide more descriptive explaination of error (e.g. password condition, duplicate email)
        return Response({"message": "An error occurred during registration"}, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    operation_summary='Password reset',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'email': openapi.Schema(type=openapi.TYPE_STRING),
        },
        required=['email'],
    ),
    responses={
        200: openapi.Response(
            description='Password reset email sent',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
        ),
        404: 'User not found',
    },
)
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
            subject='SapiensLink Password Reset',
            html_content=f'Click the following link to reset your password: {reset_url}',
        )
        sg = SendGridAPIClient(app_secrets.SENDGRID_API_KEY)  # Replace with your SendGrid API key
        sg.send(message)

        return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
    except ObjectDoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(
    method='post',
    operation_summary='Confirm password reset',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'new_password': openapi.Schema(type=openapi.TYPE_STRING),
        },
        required=['new_password'],
    ),
    responses={
        200: openapi.Response(
            description='Password reset successful',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
        ),
        400: 'Bad Request - Invalid token or password does not meet requirements',
        404: 'User not found',
    },
)
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
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            # Handle password reset confirmation logic here
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    except ObjectDoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError:
        return Response({'message': 'Invalid user ID'}, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='get',
    operation_summary='Home page',
    manual_parameters=[
        openapi.Parameter('q', openapi.IN_QUERY, description='Search query', type=openapi.TYPE_STRING),
        openapi.Parameter('follow', openapi.IN_QUERY, description='Filter by followed users (follow_true)', type=openapi.TYPE_STRING),
        openapi.Parameter('top_voted', openapi.IN_QUERY, description='Filter by top voted lists (top_voted_true)', type=openapi.TYPE_STRING),
    ],
    responses={
        200: openapi.Response(
            description='Success',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'pagination': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'next_page': openapi.Schema(type=openapi.TYPE_STRING),
                            'previous_page': openapi.Schema(type=openapi.TYPE_STRING),
                            'total_pages': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'current_page': openapi.Schema(type=openapi.TYPE_INTEGER),
                        },
                    ),
                    'lists': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT)),
                    'users': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT)),
                    'list_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'topic_counts': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING))),
                    'all_list_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                },
            ),
        ),
    },
)
@api_view(['GET'])
def home_page(request):
    q = request.GET.get('q', '')
    # TODO: Follow home sorting should be made visible to just logged in users on the front end
    # and make sure people can use enter button to send comment
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


@swagger_auto_schema(
    method='get',
    operation_summary='Get list details',
    responses={
        200: openapi.Response(
            description='Success',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'list': openapi.Schema(type=openapi.TYPE_OBJECT),
                    'list_comments': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT)),
                    'participants': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT)),
                    'has_reported': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'saved_list_ids': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_INTEGER)),
                },
            ),
        ),
    },
)
@swagger_auto_schema(
    method='post',
    operation_summary='Perform actions on the list',
    request_body=CommentSerializer,
    responses={
        201: openapi.Response(description='Comment added successfully'),
        200: openapi.Response(description='List saved successfully or unsaved successfully'),
        400: openapi.Response(description='Bad Request'),
    },
)
@api_view(['GET', 'POST'])
def list_page(request, pk):
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


@swagger_auto_schema(
    method='post',
    operation_summary='Vote on a list',
    manual_parameters=[
        openapi.Parameter(
            name='pk',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_INTEGER,
            description='ID of the list to vote on',
            required=True,
        ),
        openapi.Parameter(
            name='action',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_STRING,
            description='Vote action (upvote, downvote)',
            required=True,
        ),
    ],
    responses={
        200: openapi.Response(description='Vote action successful'),
        400: openapi.Response(description='Bad Request'),
    },
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def vote_action(request, pk, action):
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


@swagger_auto_schema(
    method='get',
    operation_summary='Get user profile details',
    manual_parameters=[
        openapi.Parameter(
            name='pk',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_INTEGER,
            description='ID of the user profile to retrieve',
            required=True,
        ),
    ],
    responses={
        200: openapi.Response(description='User profile details retrieved successfully'),
        404: openapi.Response(description='User not found'),
    },
)
@swagger_auto_schema(
    method='post',
    operation_summary='Follow/Unfollow a user',
    manual_parameters=[
        openapi.Parameter(
            name='pk',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_INTEGER,
            description='ID of the user to follow/unfollow',
            required=True,
        ),
    ],
    responses={
        200: openapi.Response(description='Follow/Unfollow action successful'),
        404: openapi.Response(description='User not found'),
    },
)
@api_view(['GET', 'POST'])
def user_profile_page(request, pk):
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


@swagger_auto_schema(
    method='get',
    operation_summary='Get private lists for a user',
    manual_parameters=[
        openapi.Parameter(
            name='pk',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_INTEGER,
            description='ID of the user to retrieve private lists',
            required=True,
        ),
    ],
    responses={
        200: openapi.Response(description='Private lists retrieved successfully'),
        404: openapi.Response(description='User not found'),
    },
)
@swagger_auto_schema(
    method='post',
    operation_summary='Follow/Unfollow a user',
    manual_parameters=[
        openapi.Parameter(
            name='pk',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_INTEGER,
            description='ID of the user to follow/unfollow',
            required=True,
        ),
    ],
    responses={
        200: openapi.Response(description='Follow/Unfollow action successful'),
        404: openapi.Response(description='User not found'),
    },
)
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def private_lists_page(request, pk):
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


@swagger_auto_schema(
    method='post',
    operation_summary='Create a list',
    request_body=ListSerializer,
    responses={
        201: openapi.Response(description='Successful Upload'),
        400: openapi.Response(description='Bad Request'),
    },
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_list_page(request):
    serializer = ListSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response({"message": "Successful Upload"}, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@swagger_auto_schema(
    method='get',
    operation_summary='Retrieve a list for updating',
    responses={
        200: openapi.Response(description='List data for updating'),
        404: openapi.Response(description='List Not Found'),
        403: openapi.Response(description='Not authorized to proceed'),
    },
)
@swagger_auto_schema(
    method='put',
    operation_summary='Update a list',
    request_body=ListSerializer,
    responses={
        200: openapi.Response(description='List data after update'),
        400: openapi.Response(description='Bad Request'),
    },
)
@swagger_auto_schema(
    method='delete',
    operation_summary='Delete a list',
    responses={
        204: openapi.Response(description='List Deleted'),
        404: openapi.Response(description='List Not Found'),
        403: openapi.Response(description='Not authorized to proceed'),
    },
)
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@api_view(['GET', 'PUT', 'DELETE'])
def update_list_page(request, pk):
    """
    Retrieve, create, update or delete a list.
    """
    try:
        list = List.objects.get(id=pk)
    except List.DoesNotExist:
        return Response({"message": "List Not Found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.user != list.author:
        return Response({"message": "Not authorized to proceed"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        # When going to update list page, we first get the data needed to prefill the form
        serializer = ListSerializer(list, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = ListSerializer(list, data=request.data, many=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        list.delete()
        return Response({"message": "List Deleted"}, status=status.HTTP_204_NO_CONTENT)


@swagger_auto_schema(
    method='delete',
    operation_summary='Delete a comment',
    responses={
        204: openapi.Response(description='Comment deleted'),
        404: openapi.Response(description='Comment Not Found'),
        403: openapi.Response(description='Not authorized to proceed'),
    },
)
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_comment_action(request, pk):
    try:
        comment = Comment.objects.get(pk=pk)
    except List.DoesNotExist:
        return Response({"message": "Comment Not Found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if the authenticated user is the owner of the comment
    if request.user != comment.user:
        return Response({'message': 'Not authorized to proceed'}, status=status.HTTP_403_FORBIDDEN)
    else:
        comment.delete()
        return Response({'message': 'Comment deleted'}, status=status.HTTP_204_NO_CONTENT)


@swagger_auto_schema(
    methods=['GET'],
    operation_summary='Retrieve user information',
    responses={
        200: openapi.Response(description='User information retrieved'),
        400: openapi.Response(description='Bad Request'),
    },
)
@swagger_auto_schema(
    methods=['PUT'],
    operation_summary='Update user information',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'name': openapi.Schema(type=openapi.TYPE_STRING, description='User name'),
            'email': openapi.Schema(type=openapi.TYPE_STRING, description='User email'),
            # Add other properties as needed
        },
        required=['name', 'email'],
    ),
    responses={
        200: openapi.Response(description='User information updated'),
        400: openapi.Response(description='Bad Request'),
    },
)
@api_view(['GET', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_user_page(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(request.data, instance=user)
        password = request.data.get('password')

        if serializer.is_valid():
            serializer.save()

            if password:
                user.set_password(password)
                user.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='GET',
    operation_summary='Retrieve topic counts based on lists',
    responses={
        200: openapi.Response(description='Topic counts retrieved successfully'),
        400: openapi.Response(description='Bad Request'),
    },
)
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


@swagger_auto_schema(
    method='GET',
    operation_summary='Retrieve users to follow based on name',
    responses={
        200: openapi.Response(description='Users to follow retrieved successfully'),
        400: openapi.Response(description='Bad Request'),
    },
)
@api_view(['GET'])
def who_to_follow_page(request):
    """
    Your function-based view documentation here.
    """
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    users = User.objects.filter(name__icontains=q).annotate(followers_count=Count('followers')).order_by('-followers_count')
    user_serializer = UserSerializer(users, many=True)
    return Response({'users': user_serializer.data}, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='POST',
    operation_summary='Report a list',
    request_body=ReportSerializer(),
    responses={
        201: openapi.Response(description='List reported successfully'),
        400: openapi.Response(description='Bad Request'),
    },
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def report_list_page(request, pk):
    serializer = ReportSerializer(data=request.data, many=False)
    list = get_object_or_404(List, id=pk)
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
    

@swagger_auto_schema(
    method='POST',
    operation_summary='Delete user account',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'password': openapi.Schema(type=openapi.TYPE_STRING),
            'confirm_delete': openapi.Schema(type=openapi.TYPE_STRING),
            'feedback': openapi.Schema(type=openapi.TYPE_STRING),
        },
        required=['password', 'confirm_delete', 'feedback'],
    ),
    responses={
        200: openapi.Response(description='Account deleted successfully'),
        400: openapi.Response(description='Bad Request'),
    },
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_user_page(request):
    password = request.data.get('password')
    confirm_delete = request.data.get('confirm_delete')
    feedback = request.data.get('feedback')

    Feedback.objects.create(feedback=feedback)

    user = authenticate(request, email=request.user.email, password=password)

    if user is not None and confirm_delete == 'on':
        # Delete the user account
        user.delete()
        logout(request)
        return Response({'message': 'Your account has been deleted'}, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid password or confirmation'}, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='GET',
    operation_summary='Get edit suggestions and comments',
    responses={
        200: openapi.Response(description='List and edit suggestions data'),
        404: openapi.Response(description='Not Found'),
    },
)
@swagger_auto_schema(
    method='POST',
    operation_summary='Add new edit suggestions and/or comments',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'edit_suggestion': openapi.Schema(
                type=openapi.TYPE_OBJECT,
                description='Properties for the edit_suggestion (if provided)',
                properties={
                    'suggestion_text': openapi.Schema(type=openapi.TYPE_STRING, description='Text for the edit suggestion'),
                },
                required=['suggestion_text'],
            ),
            'comment': openapi.Schema(
                type=openapi.TYPE_OBJECT,
                description='Properties for the comment (if provided)',
                properties={
                    'text': openapi.Schema(type=openapi.TYPE_STRING, description='Text for the comment'),
                },
                required=['text'],
            ),
        },
        required=['edit_suggestion', 'comment'],
    ),
    responses={
        201: "Edit suggestion created successfully / Comment added successfully",
        400: "Bad Request",
    }
)
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_pr_page(request, pk):
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


@swagger_auto_schema(
    method='POST',
    operation_summary='Approve Edit Suggestion',
    responses={
        200: "Suggestion approved successfully",
        403: "Permission denied",
        404: "Not Found",
    }
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def approve_suggestion_action(request, suggestion_id):
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


@swagger_auto_schema(
    method='POST',
    operation_summary='Decline Edit Suggestion',
    responses={
        200: "Suggestion declined successfully",
        403: "Permission denied",
        404: "Not Found",
    }
)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def decline_suggestion_action(request, suggestion_id):
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


@swagger_auto_schema(
    method='DELETE',
    operation_summary='Delete a comment about an Edit Suggestion',
    responses={
        204: "Comment deleted successfully",
        403: "Permission denied",
        404: "Not Found",
    }
)
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_pr_comment_action(request, comment_id):
    comment = get_object_or_404(EditComment, id=comment_id)

    # Check if the current user is the author of the comment
    if comment.commenter == request.user:
        comment.delete()
        return Response({'message': 'Comment deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    return Response({'message': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)


@swagger_auto_schema(
    method='GET',
    operation_summary='Get lists saved by an user',
    manual_parameters=[
        openapi.Parameter(
            'q',
            openapi.IN_QUERY,
            description='Search query for list names',
            type=openapi.TYPE_STRING,
        ),
    ],
    responses={
        200: "Successful response",
    }
)
@api_view(['GET'])
def saved_lists_page(request, pk):
    q = request.GET.get('q', '')
    user_saved_lists = SavedList.objects.filter(user__id=pk, list__name__icontains=q)
    serializer = SavedListSerializer(user_saved_lists, many=True)
    return Response(serializer.data)


@swagger_auto_schema(
    method='GET',
    operation_summary='Get an user latest 5 notifications',
    manual_parameters=[
        openapi.Parameter(
            'limit',
            openapi.IN_QUERY,
            description='Limit the number of notifications to retrieve (default: 5)',
            type=openapi.TYPE_INTEGER,
        ),
    ],
    responses={
        200: "Successful response",
        401: "Unauthorized",
    }
)
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


@swagger_auto_schema(
    method='POST',
    operation_summary='Mark a notification as read',
    responses={
        200: "Notification marked as read successfully",
        404: "Notification not found",
        401: "Unauthorized",
    }
)
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


# Admin Utils

@swagger_auto_schema(
    methods=['GET'],
    operation_summary='Get all lists',
    responses={
        200: openapi.Response(
            description="Successful response",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'pagination': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'next_page': openapi.Schema(type=openapi.TYPE_STRING, description='URL for the next page'),
                            'previous_page': openapi.Schema(type=openapi.TYPE_STRING, description='URL for the previous page'),
                            'total_pages': openapi.Schema(type=openapi.TYPE_INTEGER, description='Total number of pages'),
                            'current_page': openapi.Schema(type=openapi.TYPE_INTEGER, description='Current page number'),
                        },
                    ),
                    'lists': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_OBJECT, description='Serialized List data'),
                    ),
                },
            ),
        ),
    }
)
@swagger_auto_schema(
    methods=['POST'],
    operation_summary='Create multiple lists at the same time',
    request_body=openapi.Schema(
        type=openapi.TYPE_ARRAY,
        items=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'author': openapi.Schema(type=openapi.TYPE_INTEGER, description='Author ID'),
                'topic': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING)),
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='List name'),
                'content': openapi.Schema(type=openapi.TYPE_STRING, description='List content'),
                'participants': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_INTEGER)),
                'source': openapi.Schema(type=openapi.TYPE_STRING, description='Source URL'),
                'public': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Public status'),
            },
            required=['name', 'content'],
        ),
    ),
    responses={
        201: "Successful Upload",
        400: "Bad Request",
    }
)
@swagger_auto_schema(
    methods=['DELETE'],
    operation_summary='Delete all lists',
    responses={
        204: "All Lists Deleted",
    }
)
@api_view(['GET', 'POST', 'DELETE'])
@authentication_classes([JWTAuthentication])
# TODO: Uncomment before deployment
# @permission_classes([IsAdminUser])
def lists_db_setup(request):
    """
        Util to upload many lists at the same time, display them and delete them.
        This can be useful to populate and empty a local development db.
    """
    if request.method == 'GET':
        paginator = PageNumberPagination()
        paginator.page_size = LISTS_PER_PAGE  # Set the number of items per page

        lists = List.objects.all()
        paginated_queryset = paginator.paginate_queryset(lists, request)
        serializer = ListSerializer(paginated_queryset, many=True)
        
        return paginator.get_paginated_response(serializer.data)
    elif request.method == 'POST':
        serializer = ListSerializer(data=request.data, many=True)

        if serializer.is_valid():
            serializer.save()

            return Response({"message": "Successful Upload"}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        lists = List.objects.all()
        lists.delete()
        return Response({"message": "All Lists Deleted"}, status=status.HTTP_204_NO_CONTENT)



@swagger_auto_schema(
    methods=['GET'],
    operation_summary='Get all users',
    responses={
        200: openapi.Response(
            description="Successful response",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'pagination': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'next_page': openapi.Schema(type=openapi.TYPE_STRING, description='URL for the next page'),
                            'previous_page': openapi.Schema(type=openapi.TYPE_STRING, description='URL for the previous page'),
                            'total_pages': openapi.Schema(type=openapi.TYPE_INTEGER, description='Total number of pages'),
                            'current_page': openapi.Schema(type=openapi.TYPE_INTEGER, description='Current page number'),
                        },
                    ),
                    'users': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(type=openapi.TYPE_OBJECT, description='Serialized User data'),
                    ),
                },
            ),
        ),
    }
)

@swagger_auto_schema(
    methods=['POST'],
    operation_summary='Create multiple users at the same time',
    request_body=openapi.Schema(
        type=openapi.TYPE_ARRAY,
        items=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='User name'),
                'email': openapi.Schema(type=openapi.TYPE_STRING, description='User email'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='User password'),
                'bio': openapi.Schema(type=openapi.TYPE_STRING, description='User bio'),
                'avatar': openapi.Schema(type=openapi.TYPE_STRING, description='Avatar image URL'),
                'social': openapi.Schema(type=openapi.TYPE_STRING, description='Social media information'),
            },
            required=['name', 'email', 'password'],  # Define the required fields
        ),
    ),
    responses={
        201: "Successful Upload",
        400: "Bad Request",
    }
)
@swagger_auto_schema(
    methods=['DELETE'],
    operation_summary='Delete all users',
    responses={
        204: "All Users Deleted",
    }
)
@api_view(['GET', 'POST', 'DELETE'])
@authentication_classes([JWTAuthentication])
# TODO: Uncomment before deployment
# @permission_classes([IsAdminUser])
def users_db_setup(request):
    """
        Util to upload many users at the same time, display them and delete them.
        This can be useful to populate and empty a local development db.
    """
    if request.method == 'GET':
        paginator = PageNumberPagination()
        paginator.page_size = LISTS_PER_PAGE  # Set the number of items per page

        users = User.objects.all()
        paginated_queryset = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(paginated_queryset, many=True)
        
        return paginator.get_paginated_response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data, many=True)

        if serializer.is_valid():
            serializer.save()

            return Response({"message": "Successful Upload"}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        users = User.objects.all()
        users.delete()
        return Response({"message": "All Users deleted"}, status=status.HTTP_204_NO_CONTENT)