from rest_framework.decorators import api_view
from rest_framework.response import Response
from sapiensApp.models import List
from .serializers import ListSerializer
from sapiensApp.api import serializers


@api_view(['GET'])
def getRoutes(request):
    routes = [
        'GET /api',
        'GET /api/lists',
        'GET /api/list/:id'
    ]
    return Response(routes)


@api_view(['GET'])
def getLists(request):
    rooms = List.objects.all()
    serializer = ListSerializer(rooms, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def getList(request, pk):
    room = List.objects.get(id=pk)
    serializer = ListSerializer(room, many=False)
    return Response(serializer.data)