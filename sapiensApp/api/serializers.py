from rest_framework.serializers import ModelSerializer, ListField
from sapiensApp.models import List, Topic, User, Report


class TopicListField(ListField):

    def to_representation(self, data):
        return [item.name for item in data.all()] if data.exists() else []

    def to_internal_value(self, data):
        return [Topic.objects.get_or_create(name=item)[0] for item in data]


class ListSerializer(ModelSerializer):
    topic = TopicListField()

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