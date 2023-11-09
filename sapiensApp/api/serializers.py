from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from sapiensApp.models import List, Topic, User, Report


class ListSerializer(serializers.ModelSerializer):
    topic = serializers.ListField(child=serializers.CharField())

    class Meta:
        model = List
        fields = '__all__'

    def create(self, validated_data):
        topics_data = validated_data.pop('topic', [])
        list_instance = List.objects.create(**validated_data)
        for topic_name in list(topics_data):
            topic, created = Topic.objects.get_or_create(name=topic_name)
            list_instance.topic.add(topic)
        return list_instance
        

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    
class ReportSerializer(ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'