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
        # Just foreign keys and many to many relations additions creations 
        # need to be explicitly done here
        topics_data = validated_data.pop('topic', [])
        participants_data = validated_data.pop('participants', [])
        list_instance = List.objects.create(**validated_data)

        for topic_dic in topics_data:
            topic_instance, _ = Topic.objects.get_or_create(name=topic_dic['name'])
            list_instance.topic.add(topic_instance)

        # Use set method for the many-to-many relationship with participants
        list_instance.participants.set(participants_data)

        return list_instance
    
    def update(self, instance, validated_data):
        # For update ANY entity we want to change needs to be 
        # explicitly handled here
        topics_data = validated_data.pop('topic', [])
        participants_data = validated_data.pop('participants', [])

        # Update fields on the existing instance
        instance.name = validated_data.get('name', instance.name)
        instance.content = validated_data.get('content', instance.content)
        instance.source = validated_data.get('source', instance.source)
        instance.author = validated_data.get('author', instance.author)

        # Clear existing topics and add the updated ones
        instance.topic.clear()
        for topic_dic in topics_data:
            topic_instance, _ = Topic.objects.get_or_create(name=topic_dic['name'])
            instance.topic.add(topic_instance)

        # Use set method for the many-to-many relationship with participants
        instance.participants.set(participants_data)

        # Save the updated instance
        instance.save()

        return instance
        

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    
class ReportSerializer(ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'