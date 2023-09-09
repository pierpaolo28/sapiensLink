from django.contrib import admin
from .models import List, Topic, Comment, User

# Register your models here.

# admin.site.register(User)
admin.site.register(List)
admin.site.register(Topic)
admin.site.register(Comment)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass
