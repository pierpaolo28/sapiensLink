from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField, CharField, ValidationError
from sapiensApp.models import List, Topic, User, Report, Comment
import csv
from better_profanity import profanity


def load_bad_words_from_csv(csv_file_path, column_name):
    bad_words = []
    with open(csv_file_path, mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            bad_words.append(row[column_name])
    return bad_words

custom_bad_words = load_bad_words_from_csv("././custom_bad_words.csv", "word")

profanity.add_censor_words(custom_bad_words)


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
        

class FollowSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name']


class UserSerializer(ModelSerializer):
    password = CharField(write_only=True)
    followers = FollowSerializer(many=True, read_only=True)
    following = FollowSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'bio', 'avatar', 'social', 'followers', 'following']

    def create(self, validated_data):
        user = User.objects.create_user(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.email = validated_data.get('email', instance.email)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.social = validated_data.get('social', instance.social)

        # Update the password if provided
        password = validated_data.get('password')
        if password:
            instance.set_password(password)

        instance.save()
        return instance
    

class ReportSerializer(ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'


class CommentSerializer(ModelSerializer):
    def validate_body(self, value):
        if profanity.contains_profanity(value):
            raise ValidationError("Unacceptable language detected in the comment.")
        return value

    class Meta:
        model = Comment
        fields = ['user',  'body', 'updated']