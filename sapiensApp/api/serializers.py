from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField, CharField, ValidationError, Serializer, EmailField
from sapiensApp.models import List, Topic, User, Report, Comment, EditSuggestion, SavedList, EditComment
from django.contrib.auth.forms import UserCreationForm
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
        fields = ['id', 'user',  'body', 'updated']


class EditSuggestionSerializer(ModelSerializer):
    class Meta:
        model = EditSuggestion
        fields = '__all__'


class SavedListSerializer(ModelSerializer):
    class Meta:
        model = SavedList
        fields = '__all__'


class EditCommentSerializer(ModelSerializer):
    class Meta:
        model = EditComment
        fields = '__all__'


class MyUserCreationForm(UserCreationForm):
    name = CharField(max_length=200)

    def clean_name(self):
        data = self.cleaned_data['name']
        if profanity.contains_profanity(data):
            raise ValidationError("Unacceptable language detected in the name.")
        return data

    class Meta:
        model = User
        fields = ['name', 'email', 'password1', 'password2']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'].required = True

    def save(self, commit=True):
        user = super().save(commit=False)
        user.name = self.cleaned_data['name']
        if commit:
            user.save()
        return user
    

class LoginSerializer(Serializer):
    email = EmailField()
    password = CharField()