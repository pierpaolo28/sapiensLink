from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField
from sapiensApp.models import List, Topic, User, Report


class TopicSerializer(ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'


class ListSerializer(ModelSerializer):
    topic = TopicSerializer(many=True)
    participants = PrimaryKeyRelatedField(many=True, queryset=User.objects.all())

    class Meta:
        model = List
        fields = '__all__'

    def create(self, validated_data):
        topics_data = validated_data.pop('topic', [])
        participants_data = validated_data.pop('participants', [])
        list_instance = List.objects.create(**validated_data)

        for topic_dic in topics_data:
            topic_instance, _ = Topic.objects.get_or_create(name=topic_dic['name'])
            list_instance.topic.add(topic_instance)

        # Use set method for the many-to-many relationship with participants
        list_instance.participants.set(participants_data)

        return list_instance
        

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    
class ReportSerializer(ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'