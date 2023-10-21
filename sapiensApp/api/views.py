from rest_framework.decorators import api_view
from rest_framework.response import Response
from sapiensApp.models import List, User, Report
from .serializers import ListSerializer, UserSerializer, ReportSerializer
from sapiensApp.api import serializers


@api_view(['GET'])
def getRoutes(request):
    routes = [
        'GET /api',
        'GET /api/lists',
        'GET /api/list/:id'
        'GET /api/users',
        'GET /api/reports',
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