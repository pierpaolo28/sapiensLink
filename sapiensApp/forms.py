from django.forms import ModelForm
from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import List, User, Report, EditSuggestion, EditComment


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
    
    class Meta:
        model = List
        fields = '__all__'
        exclude = ['author', 'participants', 'score', 'topic']  # Exclude 'topic' since we define it manually


class MyUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['name', 'email', 'password1', 'password2']

class UserForm(ModelForm):
    class Meta:
        model = User
        fields = ['avatar', 'name', 'email', 'bio', 'social']

class ReportForm(ModelForm):
    class Meta:
        model = Report
        fields = ['reason']


class EditSuggestionForm(ModelForm):
    class Meta:
        model = EditSuggestion
        fields = ['suggestion_text']

class EditCommentForm(ModelForm):
    class Meta:
        model = EditComment
        fields = ['text']