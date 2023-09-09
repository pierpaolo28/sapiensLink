from django.forms import ModelForm
from django.contrib.auth.forms import UserCreationForm
from .models import List, User


class ListForm(ModelForm):
    class Meta:
        model = List
        fields = '__all__'
        exclude = ['host', 'participants']


class UserForm(ModelForm):
    class Meta:
        model = User
        fields = ['avatar', 'name', 'email', 'bio']
