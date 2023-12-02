from django.forms import ModelForm
from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import *
import json
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

custom_bad_words = load_bad_words_from_csv("./custom_bad_words.csv", "word")

profanity.add_censor_words(custom_bad_words)

class ListForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['content'].required = True

    # TODO Make proper list of topics
    # Define your fixed list of choices
    TOPIC_CHOICES = [
        ("Economics", "Economics"),
        ("Finance", "Finance"),
        ("Management", "Management"),
        ("Tech", "Tech"),
        ("Education", "Education"),
    ]

    # Use MultipleChoiceField with the SelectMultiple widget configured for Select2
    topic = forms.MultipleChoiceField(
        choices=TOPIC_CHOICES,
        widget=forms.SelectMultiple(attrs={'class': 'select2', 'style': 'width: 100%'}),
        required=True
    )
    
    def clean_name(self):
        data = self.cleaned_data['name']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the name.")
        return data
    
    def clean_description(self):
        data = self.cleaned_data['description']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the description.")
        return data

    def clean_content(self):
        data = self.cleaned_data['content']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the content.")
        return data
    
    class Meta:
        model = List
        fields = '__all__'
        exclude = ['author', 'participants', 'score', 'topic']  # Exclude 'topic' since we define it manually


class RankForm(ModelForm):
    # TODO Make proper list of topics
    # Define your fixed list of choices
    TOPIC_CHOICES = [
        ("Economics", "Economics"),
        ("Finance", "Finance"),
        ("Management", "Management"),
        ("Tech", "Tech"),
        ("Education", "Education"),
    ]

    # Use MultipleChoiceField with the SelectMultiple widget configured for Select2
    topic = forms.MultipleChoiceField(
        choices=TOPIC_CHOICES,
        widget=forms.SelectMultiple(attrs={'class': 'select2', 'style': 'width: 100%'}),
        required=True
    )

    content = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'your-textarea-class'}),
        required=True
    )

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)
    
    def clean_name(self):
        data = self.cleaned_data['name']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the name.")
        return data
    
    def clean_description(self):
        data = self.cleaned_data['description']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the description.")
        return data

    def clean_content(self):
        data = self.cleaned_data['content']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the content.")

        # Assuming you have access to the current user (you may need to modify this part based on your view)
        user_id = self.request.user.id if self.request and self.request.user.is_authenticated else None

        # Generate a unique ID combining timestamp and UUID
        unique_id = f"{timezone.now().isoformat()}-{uuid.uuid4()}"

        # Convert the input text to a dictionary with the unique ID as the key and element, user ID as values
        content_dict = {unique_id: {'element': data, 'user_id': user_id}} if user_id else None

        return content_dict if content_dict is not None else None
    
    class Meta:
        model = Rank
        fields = '__all__'
        exclude = ['contributors', 'score', 'topic']  # Exclude 'topic' since we define it manually


class CommentForm(ModelForm):

    def clean_body(self):
        data = self.cleaned_data['body']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the comment.")
        return data

    class Meta:
        model = Comment
        fields = ['body']


class MyUserCreationForm(UserCreationForm):

    def clean_name(self):
        data = self.cleaned_data['name']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the name.")
        return data

    class Meta:
        model = User
        fields = ['name', 'email', 'password1', 'password2']

class UserForm(ModelForm):

    def clean_name(self):
        data = self.cleaned_data['name']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the name.")
        return data
    
    def clean_bio(self):
        data = self.cleaned_data['bio']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the bio.")
        return data

    class Meta:
        model = User
        fields = ['avatar', 'name', 'email', 'bio', 'social']


class ReportForm(ModelForm):
    class Meta:
        model = Report
        fields = ['reason']


class ReportRankForm(ModelForm):
    class Meta:
        model = RankReport
        fields = ['reason']


class EditSuggestionForm(ModelForm):

    def clean_suggestion_text(self):
        data = self.cleaned_data['suggestion_text']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the suggested new list.")
        return data

    class Meta:
        model = EditSuggestion
        fields = ['suggestion_text']

class EditCommentForm(ModelForm):

    def clean_text(self):
        data = self.cleaned_data['text']
        if profanity.contains_profanity(data):
            raise forms.ValidationError("Unacceptable language detected in the comment.")
        return data

    class Meta:
        model = EditComment
        fields = ['text']