from django.forms import ModelForm
from django.contrib.auth.forms import UserCreationForm
from .models import List, User, Report, EditSuggestion, EditComment


class ListForm(ModelForm):
    class Meta:
        model = List
        fields = '__all__'
        exclude = ['author', 'participants']

class MyUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['name', 'email', 'password1', 'password2']

class UserForm(ModelForm):
    class Meta:
        model = User
        fields = ['avatar', 'name', 'email', 'bio']

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