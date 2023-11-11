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


@api_view(['GET'])
def getRoutes(request):
    routes = [
        'GET /api',
        'POST /api/mass-lists/',
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
    ]
    return Response(routes)


@api_view(['POST'])
def mass_list_upload(request):
    for item in request.data:
        serializer = ListSerializer(data=item)
        if serializer.is_valid():
            topics_data = item.get('topic', [])
            participants_data = item.get('participants', [])
            name = item.get('name', None)  # Adjust this based on the field names in your request data
            content = item.get('content', None)
            source = item.get('source', '')
            author = item.get('author', None)
            if author:
                author = User.objects.get(id=author)
            else:
                author = None

            # Create the List instance
            list_instance = serializer.create(validated_data={
                'name': name,
                'content': content,
                'source': source,
                'author': author
            })

            # Handle the many-to-many relationship with topics
            for topic_name in topics_data:
                topic = Topic.objects.get(name=topic_name)
                list_instance.topic.add(topic)

            # Handle the many-to-many relationship with participants
            for participant_id in participants_data:
                participant = User.objects.get(id=participant_id)
                list_instance.participants.add(participant)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"outcome": "successful upload"}, status=status.HTTP_201_CREATED)



@api_view(['GET', 'POST', 'DELETE'])
def lists(request):
    """
    Retrieve/delete lists or make one.
    """

    if request.method == 'GET':
        paginator = PageNumberPagination()
        paginator.page_size = 10  # Set the number of items per page

        lists = List.objects.all()
        paginated_queryset = paginator.paginate_queryset(lists, request)
        serialized_data = []
        for item in paginated_queryset:
            data = {
                'id': item.id,
                'author': item.author.id if item.author else None,
                'name': item.name,
                'content': item.content,
                'source': item.source,
                'score': item.score,
                'participants': [i.id for i in item.participants.all() if i],
                'topic': [i.name for i in item.topic.all() if i],
                'public': item.public,
            }
            serialized_data.append(data)
        
        return paginator.get_paginated_response(serialized_data)
    
    elif request.method == 'POST':
        serializer = ListSerializer(data=request.data)
        if serializer.is_valid():
            topics_data = request.data.get('topic', [])
            participants_data = request.data.get('participants', [])
            name = request.data.get('name', None)  # Adjust this based on the field names in your request data
            content = request.data.get('content', None)
            source = request.data.get('source', '')
            author = request.data.get('author', None)
            if author:
                author = User.objects.get(id=author)
            else:
                author = None

            # Create the List instance
            list_instance = List.objects.create(name=name, content=content, 
                                                source=source, author=author)

            # Handle the many-to-many relationship with topics
            for topic_name in topics_data:
                topic, created = Topic.objects.get_or_create(name=topic_name)
                list_instance.topic.add(topic)

            # Handle the many-to-many relationship with participants
            for participant_id in participants_data:
                participant = User.objects.get(id=participant_id)
                list_instance.participants.add(participant)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        lists.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'PUT', 'DELETE'])
def list(request, pk):
    """
    Retrieve, update or delete a list.
    """
    try:
        list = List.objects.get(id=pk)
    except List.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

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
        return Response(status=status.HTTP_204_NO_CONTENT)


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
        users.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

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
        serializer = UserSerializer(user, data=request.data, many=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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