from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from sapiensApp.models import List, Topic, User, Report, Notification
from .serializers import ListSerializer, UserSerializer, ReportSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count
from django.db.models import Q
from django.core.paginator import Paginator

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
        if serializer.is_valid():
            serializer.save()
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