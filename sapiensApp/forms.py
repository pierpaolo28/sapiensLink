from django.forms import ModelForm
from django.contrib.auth.forms import UserCreationForm
from .models import List, User


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
