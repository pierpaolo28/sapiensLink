from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from sapiensApp.models import List, User, Report, Notification
from .serializers import ListSerializer, UserSerializer, ReportSerializer
from sapiensApp.api import serializers
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


@api_view(['GET'])
def getRoutes(request):
    routes = [
        'GET /api',
        'GET /api/lists',
        'GET /api/list/:id'
        'GET /api/users',
        'GET /api/reports',
        'GET /api/notifications',
        'GET /api/notifications/<int:notification_id>/mark_as_read/',
        'GET /api/token',
        'GET /api/token/refresh',
    ]
    return Response(routes)


@api_view(['GET'])
def getLists(request):
    lists = List.objects.all()
    serializer = ListSerializer(lists, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def getList(request, pk):
    list = List.objects.get(id=pk)
    serializer = ListSerializer(list, many=False)
    return Response(serializer.data)


@api_view(['GET'])
def getUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def getReports(request):
    reports = Report.objects.all()
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data)


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