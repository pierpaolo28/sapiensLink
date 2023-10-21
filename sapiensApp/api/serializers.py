from rest_framework.serializers import ModelSerializer
from sapiensApp.models import List, User, Report


class ListSerializer(ModelSerializer):
    class Meta:
        model = List
        fields = '__all__'


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    
class ReportSerializer(ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'