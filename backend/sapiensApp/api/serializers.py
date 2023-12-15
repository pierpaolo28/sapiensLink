from rest_framework.serializers import *
from sapiensApp.models import *
from django.contrib.auth.forms import UserCreationForm
import csv
from better_profanity import profanity
import uuid
from django.utils import timezone


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
    def validate_name(self, data):
        if profanity.contains_profanity(data):
            raise ValidationError("Unacceptable language detected in the name.")
        return data
    
    def validate_description(self, data):
        if profanity.contains_profanity(data):
            raise ValidationError("Unacceptable language detected in the description.")
        return data

    def validate_content(self, data):
        if profanity.contains_profanity(data):
            raise ValidationError("Unacceptable language detected in the content.")
        return data

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
        list_instance.subscribed_users.set(participants_data)

        return list_instance
    
    def update(self, instance, validated_data):
        # For update ANY entity we want to change needs to be 
        # explicitly handled here
        topics_data = validated_data.pop('topic', None)
        participants_data = validated_data.pop('participants', None)

        # Update fields on the existing instance
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.content = validated_data.get('content', instance.content)
        instance.source = validated_data.get('source', instance.source)

        # Clear existing topics and add the updated ones if provided
        if topics_data is not None:
            instance.topic.clear()
            for topic_dic in topics_data:
                topic_instance, _ = Topic.objects.get_or_create(name=topic_dic['name'])
                instance.topic.add(topic_instance)

        # Use set method for the many-to-many relationship with participants if provided
        if participants_data is not None:
            instance.participants.set(participants_data)
            instance.subscribed_users.set(participants_data)

        # Save the updated instance
        instance.save()

        return instance
    

class RankTopicSerializer(ModelSerializer):
    class Meta:
        model = RankTopic
        fields = '__all__'


class RankContentElementSerializer(Serializer):
    element = CharField()
    user_id = IntegerField()


class RankSerializer(ModelSerializer):
    topic = RankTopicSerializer(many=True)
    contributors = PrimaryKeyRelatedField(many=True, queryset=User.objects.all())
    content = DictField(
        child=RankContentElementSerializer(),
        required=False
    )

    class Meta:
        model = Rank
        exclude = ['embeddings']

    def validate_name(self, value):
        if profanity.contains_profanity(value):
            raise ValidationError("Unacceptable language detected in the name.")
        return value
    
    def validate_description(self, value):
        if profanity.contains_profanity(value):
            raise ValidationError("Unacceptable language detected in the description.")
        return value

    def validate_content(self, value):
        element_values = ''.join([content['element'] for content in value.values()])
        if profanity.contains_profanity(element_values):
            raise ValidationError("Unacceptable language detected in the content.")
        
        return value

    def create(self, validated_data):
        # Extract 'content' data and generate unique IDs
        content_data = validated_data.pop('content', [])  
        validated_data['content'] = {
            f"{timezone.now().isoformat()}-{uuid.uuid4()}": {
                'element': content_data[key]['element'],
                'user_id': content_data[key]['user_id']
            }
            for key in content_data
        }


        # Process 'topic' and 'contributors' fields
        topics_data = validated_data.pop('topic', [])
        contributors_data = validated_data.pop('contributors', [])

        # Create the Rank instance
        rank_instance = Rank.objects.create(**validated_data)

        for topic_dic in topics_data:
            topic_instance, _ = RankTopic.objects.get_or_create(name=topic_dic['name'])
            rank_instance.topic.add(topic_instance)

        rank_instance.contributors.set(contributors_data)
        rank_instance.subscribed_users.set(contributors_data)

        return rank_instance

    def update(self, instance, validated_data):
            # Allowing updating of existing elements in the rank, but new elements can't be added 
            content_data = validated_data.pop('content', instance.content)
            content = []
            for key in instance.content:
                if key in content_data:
                    content.append({
                        key: {
                            'element': content_data[key]['element'],
                            'user_id': content_data[key]['user_id']
                        }})
                else:
                    content.append({
                        key: {
                            'element': instance.content[key]['element'],
                            'user_id': instance.content[key]['user_id']
                        }})
            instance.content = {k:v for element in content for k,v in element.items()}
            # For update ANY entity we want to change needs to be 
            # explicitly handled here
            topics_data = validated_data.pop('topic', None)
            contributors_data = validated_data.pop('contributors', None)

            # Update fields on the existing instance
            instance.name = validated_data.get('name', instance.name)
            instance.description = validated_data.get('description', instance.description)

            # Clear existing topics and add the updated ones if provided
            if topics_data is not None:
                instance.topic.clear()
                for topic_dic in topics_data:
                    topic_instance, _ = RankTopic.objects.get_or_create(name=topic_dic['name'])
                    instance.topic.add(topic_instance)

            # Use set method for the many-to-many relationship with participants if provided
            if contributors_data is not None:
                instance.contributors.set(contributors_data)
                instance.subscribed_users.set(contributors_data)

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
    avatar = ImageField(allow_null=True, required=False)
    

    def validate_name(self, data):
        if profanity.contains_profanity(data):
            raise ValidationError("Unacceptable language detected in the name.")
        return data
    
    def validate_bio(self, data):
        if profanity.contains_profanity(data):
            raise ValidationError("Unacceptable language detected in the bio.")
        return data

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


class ReportRankSerializer(ModelSerializer):
    class Meta:
        model = RankReport
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

    def validate_suggestion_text(self, data):
        if profanity.contains_profanity(data):
            raise ValidationError("Unacceptable language detected in the suggested new list.")
        return data

    class Meta:
        model = EditSuggestion
        fields = '__all__'


class SavedListSerializer(ModelSerializer):
    class Meta:
        model = SavedList
        fields = '__all__'


class RankSavedSerializer(ModelSerializer):
    class Meta:
        model = RankSaved
        fields = '__all__'


class EditCommentSerializer(ModelSerializer):

    def validate_text(self, data):
        if profanity.contains_profanity(data):
            raise ValidationError("Unacceptable language detected in the comment.")
        return data

    class Meta:
        model = EditComment
        fields = '__all__'


class CreateElementSerializer(Serializer):
    element = CharField(label='New Element')

    def validate_element(self, value):
        if profanity.contains_profanity(value):
            raise ValidationError("Unacceptable language detected in new element.")
        return value


class EditElementSerializer(Serializer):
    edit_element = CharField(label='Edit Element')

    def validate_edit_element(self, value):
        if profanity.contains_profanity(value):
            raise ValidationError("Unacceptable language detected in the edited element.")
        return value


class MyUserCreationForm(UserCreationForm):
    name = CharField(max_length=200)

    def validate_name(self, data):
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
    

class RegisterSerializer(Serializer):
    name = CharField(max_length=200)
    email = EmailField()
    password1 = CharField(write_only=True, style={'input_type': 'password'})
    password2 = CharField(write_only=True, style={'input_type': 'password'})

    def validate_name(self, value):
        if profanity.contains_profanity(value):
            raise ValidationError("Unacceptable language detected in the name.")
        return value

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise ValidationError("Passwords do not match.")
        return data
    

class LoginSerializer(Serializer):
    email = EmailField()
    password = CharField()


class EmailUnsubscribeSerializer(Serializer):
    inactive = BooleanField(required=False)
    unread = BooleanField(required=False)