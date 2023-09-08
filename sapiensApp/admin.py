from django.contrib import admin
from .models import List, Topic, Message, User

# Register your models here.

admin.site.register(User)
admin.site.register(List)
admin.site.register(Topic)
admin.site.register(Message)
